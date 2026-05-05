using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Items;
using PriceManagement.Application.Mappings;
using PriceManagement.Application.Services.Interfaces;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Enums;
using PriceManagement.Domain.Exceptions;
using PriceManagement.Domain.Interfaces;

namespace PriceManagement.Application.Services.Implementations;

/// <summary>
/// Implementation of IItemService with SWR (Stale-While-Revalidate) caching via Redis.
///
/// SWR Strategy:
///   1. Data is cached in Redis with absolute TTL of 1 hour.
///   2. A separate "fresh" marker key expires after 3 seconds.
///   3. When marker exists → data is "fresh" → serve from cache immediately.
///   4. When marker expired → data is "stale" → serve cached data + trigger background DB refresh.
///   5. Refresh button → invalidates cache completely → forces fresh fetch.
/// </summary>
public class ItemService : IItemService
{
    private readonly IItemRepository _itemRepository;
    private readonly IDistributedCache _cache;
    private readonly ILogger<ItemService> _logger;

    /// <summary>Redis options: absolute TTL for cached data (1 hour).</summary>
    private static readonly DistributedCacheEntryOptions DataCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(AppConstants.RedisCacheTtlSeconds)
    };

    /// <summary>Redis options: SWR stale marker (3 seconds fresh window).</summary>
    private static readonly DistributedCacheEntryOptions FreshMarkerOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(AppConstants.RedisStaleAfterSeconds)
    };

    public ItemService(
        IItemRepository itemRepository,
        IDistributedCache cache,
        ILogger<ItemService> logger)
    {
        _itemRepository = itemRepository;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<ItemDto>> GetAllAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Retrieving items - Page: {PageNumber}, Size: {PageSize}, Search: {Search}",
            request.PageNumber, request.PageSize, request.Search);

        var cacheKey = string.Format(AppConstants.CacheKeyItemList, request.PageNumber, request.PageSize, request.Search ?? "");
        var freshKey = cacheKey + AppConstants.StaleMarkerSuffix;

        // Try cache first
        var cachedResult = await GetFromCacheAsync<PagedResult<ItemDto>>(cacheKey, cancellationToken);
        if (cachedResult != null)
        {
            // Check if data is still "fresh" (marker key exists)
            var freshMarker = await GetFromCacheAsync<string>(freshKey, cancellationToken);
            if (freshMarker != null)
            {
                _logger.LogInformation("SWR: FRESH cache hit for items list. Key: {CacheKey}", cacheKey);
                return cachedResult;
            }

            // Data is stale — serve it now, refresh in background
            _logger.LogInformation("SWR: STALE cache hit for items list. Serving stale data + background refresh.");
            _ = Task.Run(() => RefreshItemListCacheAsync(request, cacheKey, freshKey), CancellationToken.None);
            return cachedResult;
        }

        _logger.LogInformation("SWR: Cache MISS for items list. Fetching from database.");
        return await FetchAndCacheItemListAsync(request, cacheKey, freshKey, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<ItemDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(AppConstants.CacheKeyItemById, id);
        var freshKey = cacheKey + AppConstants.StaleMarkerSuffix;

        var cached = await GetFromCacheAsync<ItemDto>(cacheKey, cancellationToken);
        if (cached != null)
        {
            var freshMarker = await GetFromCacheAsync<string>(freshKey, cancellationToken);
            if (freshMarker != null) return cached;

            // Stale — serve + background refresh
            _ = Task.Run(async () =>
            {
                var item = await _itemRepository.GetByIdAsync(id, CancellationToken.None);
                if (item != null)
                {
                    var dto = item.ToDto();
                    await SetCacheAsync(cacheKey, dto, DataCacheOptions, CancellationToken.None);
                    await SetCacheAsync(freshKey, "1", FreshMarkerOptions, CancellationToken.None);
                }
            }, CancellationToken.None);
            return cached;
        }

        var entity = await _itemRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Item), id);

        var result = entity.ToDto();
        await SetCacheAsync(cacheKey, result, DataCacheOptions, cancellationToken);
        await SetCacheAsync(freshKey, "1", FreshMarkerOptions, cancellationToken);
        return result;
    }

    /// <inheritdoc/>
    public async Task<ItemDetailDto> GetDetailAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(AppConstants.CacheKeyItemDetail, id);
        var freshKey = cacheKey + AppConstants.StaleMarkerSuffix;

        var cached = await GetFromCacheAsync<ItemDetailDto>(cacheKey, cancellationToken);
        if (cached != null)
        {
            var freshMarker = await GetFromCacheAsync<string>(freshKey, cancellationToken);
            if (freshMarker != null) return cached;

            _ = Task.Run(async () =>
            {
                var item = await _itemRepository.GetWithSupplierPricesAsync(id, CancellationToken.None);
                if (item != null)
                {
                    var dto = item.ToDetailDto();
                    await SetCacheAsync(cacheKey, dto, DataCacheOptions, CancellationToken.None);
                    await SetCacheAsync(freshKey, "1", FreshMarkerOptions, CancellationToken.None);
                }
            }, CancellationToken.None);
            return cached;
        }

        var entity = await _itemRepository.GetWithSupplierPricesAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Item), id);

        var result = entity.ToDetailDto();
        await SetCacheAsync(cacheKey, result, DataCacheOptions, cancellationToken);
        await SetCacheAsync(freshKey, "1", FreshMarkerOptions, cancellationToken);
        return result;
    }

    /// <inheritdoc/>
    public async Task<ItemDto> CreateAsync(CreateItemRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating new item with code: {ItemCode}", request.ItemCode);

        // Check for duplicate item code (business rule: codes must be unique)
        var existingItem = await _itemRepository.GetByCodeAsync(request.ItemCode.Trim(), cancellationToken);
        if (existingItem != null)
        {
            throw new ConflictException($"Item with code '{request.ItemCode}' already exists.");
        }

        var entity = request.ToEntity();
        await _itemRepository.AddAsync(entity, cancellationToken);
        await _itemRepository.SaveChangesAsync(cancellationToken);

        // Invalidate list cache (new item added) — force fresh on next request
        await InvalidateItemListCacheAsync(cancellationToken);

        _logger.LogInformation("Item created successfully with ID: {ItemId}", entity.Id);
        return entity.ToDto();
    }

    /// <inheritdoc/>
    public async Task<ItemDto> UpdateAsync(Guid id, UpdateItemRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating item with ID: {ItemId}", id);

        var entity = await _itemRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Item), id);

        // Optimistic concurrency check
        if (entity.RowVersion != request.RowVersion)
        {
            throw new ConflictException("The record has been modified by another user. Please refresh and try again.");
        }

        // Apply updates
        entity.ItemName = request.ItemName.Trim();
        entity.Description = request.Description?.Trim();
        entity.Unit = request.Unit.Trim().ToUpperInvariant();
        entity.Category = request.Category?.Trim();
        entity.BasePrice = request.BasePrice;
        entity.Metadata = request.Metadata != null && request.Metadata.Count > 0
            ? System.Text.Json.JsonSerializer.Serialize(request.Metadata)
            : null;
        entity.Status = Enum.Parse<EntityStatus>(request.Status, true);

        _itemRepository.Update(entity);
        await _itemRepository.SaveChangesAsync(cancellationToken);

        // Invalidate all caches for this item and list
        await InvalidateItemCacheAsync(id, cancellationToken);

        _logger.LogInformation("Item updated successfully: {ItemId}", id);
        return entity.ToDto();
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Soft-deleting item with ID: {ItemId}", id);

        var entity = await _itemRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Item), id);

        _itemRepository.SoftDelete(entity);
        await _itemRepository.SaveChangesAsync(cancellationToken);

        // Invalidate caches
        await InvalidateItemCacheAsync(id, cancellationToken);

        _logger.LogInformation("Item soft-deleted successfully: {ItemId}", id);
    }

    // ========================================
    // SWR cache helper methods
    // ========================================

    /// <summary>
    /// Fetches item list from DB and caches both data + fresh marker.
    /// </summary>
    private async Task<PagedResult<ItemDto>> FetchAndCacheItemListAsync(
        PagedRequest request, string cacheKey, string freshKey, CancellationToken ct)
    {
        // Build filter expression from search keyword
        System.Linq.Expressions.Expression<Func<Item, bool>>? filter = null;
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            filter = i => i.ItemCode.ToLower().Contains(search) ||
                          i.ItemName.ToLower().Contains(search) ||
                          (i.Description != null && i.Description.ToLower().Contains(search));
        }

        // Build ordering function
        Func<IQueryable<Item>, IOrderedQueryable<Item>>? orderBy = request.SortBy?.ToLower() switch
        {
            "itemcode" => request.SortDirection == "desc"
                ? q => q.OrderByDescending(i => i.ItemCode)
                : q => q.OrderBy(i => i.ItemCode),
            "itemname" => request.SortDirection == "desc"
                ? q => q.OrderByDescending(i => i.ItemName)
                : q => q.OrderBy(i => i.ItemName),
            "createdat" => request.SortDirection == "desc"
                ? q => q.OrderByDescending(i => i.CreatedAt)
                : q => q.OrderBy(i => i.CreatedAt),
            _ => q => q.OrderByDescending(i => i.CreatedAt)
        };

        var (items, totalCount) = await _itemRepository.GetPagedAsync(
            filter, orderBy, request.PageNumber, request.PageSize, ct);

        var result = new PagedResult<ItemDto>
        {
            Items = items.Select(i => i.ToDto()).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        // Cache data (1 hour) + fresh marker (3 seconds)
        await SetCacheAsync(cacheKey, result, DataCacheOptions, ct);
        await SetCacheAsync(freshKey, "1", FreshMarkerOptions, ct);
        return result;
    }

    /// <summary>
    /// Background refresh: fetches fresh data from DB and updates cache.
    /// Called when stale data is served to a user.
    /// </summary>
    private async Task RefreshItemListCacheAsync(PagedRequest request, string cacheKey, string freshKey)
    {
        try
        {
            _logger.LogInformation("SWR: Background refresh started for items list.");
            await FetchAndCacheItemListAsync(request, cacheKey, freshKey, CancellationToken.None);
            _logger.LogInformation("SWR: Background refresh completed for items list.");
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "SWR: Background refresh failed for items list. Stale data will continue to be served.");
        }
    }

    /// <summary>
    /// Attempts to retrieve a cached value. Returns null on cache miss or Redis failure.
    /// Uses try-catch to ensure Redis downtime does not break the application (cache-aside pattern).
    /// </summary>
    private async Task<T?> GetFromCacheAsync<T>(string key, CancellationToken ct) where T : class
    {
        try
        {
            var cached = await _cache.GetStringAsync(key, ct);
            if (cached == null) return null;
            return JsonSerializer.Deserialize<T>(cached);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache read failed for key: {CacheKey}. Falling back to database.", key);
            return null;
        }
    }

    /// <summary>
    /// Writes a value to the cache. Silently fails if Redis is unavailable.
    /// </summary>
    private async Task SetCacheAsync<T>(string key, T value, DistributedCacheEntryOptions options, CancellationToken ct)
    {
        try
        {
            var json = JsonSerializer.Serialize(value);
            await _cache.SetStringAsync(key, json, options, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache write failed for key: {CacheKey}. Continuing without cache.", key);
        }
    }

    /// <summary>
    /// Invalidates all caches related to a specific item (ID, detail, and list).
    /// Called after create/update/delete to ensure consistency.
    /// </summary>
    private async Task InvalidateItemCacheAsync(Guid id, CancellationToken ct)
    {
        try
        {
            // Remove data keys
            await _cache.RemoveAsync(string.Format(AppConstants.CacheKeyItemById, id), ct);
            await _cache.RemoveAsync(string.Format(AppConstants.CacheKeyItemDetail, id), ct);
            // Remove fresh markers
            await _cache.RemoveAsync(string.Format(AppConstants.CacheKeyItemById, id) + AppConstants.StaleMarkerSuffix, ct);
            await _cache.RemoveAsync(string.Format(AppConstants.CacheKeyItemDetail, id) + AppConstants.StaleMarkerSuffix, ct);
            // Invalidate list cache (most common page)
            await InvalidateItemListCacheAsync(ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache invalidation failed for item: {ItemId}", id);
        }
    }

    /// <summary>
    /// Invalidates the items list cache (data + fresh marker).
    /// </summary>
    private async Task InvalidateItemListCacheAsync(CancellationToken ct)
    {
        try
        {
            var listKey = string.Format(AppConstants.CacheKeyItemList, 1, AppConstants.DefaultPageSize, "");
            await _cache.RemoveAsync(listKey, ct);
            await _cache.RemoveAsync(listKey + AppConstants.StaleMarkerSuffix, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache invalidation failed for items list.");
        }
    }
}
