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
/// Implementation of IItemService with Redis distributed caching.
/// Caches list and detail results, automatically invalidates on create/update/delete.
/// </summary>
public class ItemService : IItemService
{
    private readonly IItemRepository _itemRepository;
    private readonly IDistributedCache _cache;
    private readonly ILogger<ItemService> _logger;

    // Cache key patterns for consistent key naming
    private const string CacheKeyAllItems = "items:all:{0}:{1}:{2}"; // page:size:search
    private const string CacheKeyItemById = "items:id:{0}";
    private const string CacheKeyItemDetail = "items:detail:{0}";

    // Cache duration — 5 minutes for listing, 10 minutes for single item
    private static readonly DistributedCacheEntryOptions ListCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5),
        SlidingExpiration = TimeSpan.FromMinutes(2)
    };

    private static readonly DistributedCacheEntryOptions ItemCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10),
        SlidingExpiration = TimeSpan.FromMinutes(3)
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

        // Try cache first
        var cacheKey = string.Format(CacheKeyAllItems, request.PageNumber, request.PageSize, request.Search ?? "");
        var cachedResult = await GetFromCacheAsync<PagedResult<ItemDto>>(cacheKey, cancellationToken);
        if (cachedResult != null)
        {
            _logger.LogInformation("Cache HIT for items list. Key: {CacheKey}", cacheKey);
            return cachedResult;
        }

        _logger.LogInformation("Cache MISS for items list. Querying database...");

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
            filter, orderBy, request.PageNumber, request.PageSize, cancellationToken);

        var result = new PagedResult<ItemDto>
        {
            Items = items.Select(i => i.ToDto()).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        // Write to cache
        await SetCacheAsync(cacheKey, result, ListCacheOptions, cancellationToken);
        return result;
    }

    /// <inheritdoc/>
    public async Task<ItemDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(CacheKeyItemById, id);
        var cached = await GetFromCacheAsync<ItemDto>(cacheKey, cancellationToken);
        if (cached != null) return cached;

        var item = await _itemRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Item), id);

        var dto = item.ToDto();
        await SetCacheAsync(cacheKey, dto, ItemCacheOptions, cancellationToken);
        return dto;
    }

    /// <inheritdoc/>
    public async Task<ItemDetailDto> GetDetailAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(CacheKeyItemDetail, id);
        var cached = await GetFromCacheAsync<ItemDetailDto>(cacheKey, cancellationToken);
        if (cached != null) return cached;

        var item = await _itemRepository.GetWithSupplierPricesAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Item), id);

        var dto = item.ToDetailDto();
        await SetCacheAsync(cacheKey, dto, ItemCacheOptions, cancellationToken);
        return dto;
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

        // Invalidate list cache (new item added)
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

        // Invalidate caches for this item and list
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
    // Redis cache helper methods
    // ========================================

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
    /// Invalidates all caches related to a specific item (by ID, detail, and list).
    /// </summary>
    private async Task InvalidateItemCacheAsync(Guid id, CancellationToken ct)
    {
        try
        {
            await _cache.RemoveAsync(string.Format(CacheKeyItemById, id), ct);
            await _cache.RemoveAsync(string.Format(CacheKeyItemDetail, id), ct);
            // Note: List cache uses pattern-based keys; we invalidate the most common page
            await _cache.RemoveAsync(string.Format(CacheKeyAllItems, 1, 100, ""), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache invalidation failed for item: {ItemId}", id);
        }
    }

    /// <summary>
    /// Invalidates the items list cache.
    /// </summary>
    private async Task InvalidateItemListCacheAsync(CancellationToken ct)
    {
        try
        {
            await _cache.RemoveAsync(string.Format(CacheKeyAllItems, 1, 100, ""), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache invalidation failed for items list.");
        }
    }
}
