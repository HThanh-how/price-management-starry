using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Prices;
using PriceManagement.Application.Mappings;
using PriceManagement.Application.Services.Interfaces;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Enums;
using PriceManagement.Domain.Exceptions;
using PriceManagement.Domain.Interfaces;

namespace PriceManagement.Application.Services.Implementations;

/// <summary>
/// Implementation of IPriceService with Redis distributed caching.
/// Validates Item and Supplier existence before creating price records.
/// </summary>
public class PriceService : IPriceService
{
    private readonly IPriceRepository _priceRepository;
    private readonly IItemRepository _itemRepository;
    private readonly ISupplierRepository _supplierRepository;
    private readonly IDistributedCache _cache;
    private readonly ILogger<PriceService> _logger;

    private const string CacheKeyAllPrices = "prices:all:{0}:{1}";
    private const string CacheKeyPricesByItem = "prices:item:{0}";

    private static readonly DistributedCacheEntryOptions ListCacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(3),
        SlidingExpiration = TimeSpan.FromMinutes(1)
    };

    public PriceService(
        IPriceRepository priceRepository,
        IItemRepository itemRepository,
        ISupplierRepository supplierRepository,
        IDistributedCache cache,
        ILogger<PriceService> logger)
    {
        _priceRepository = priceRepository;
        _itemRepository = itemRepository;
        _supplierRepository = supplierRepository;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<PriceDto>> GetAllAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Retrieving price records - Page: {PageNumber}, Size: {PageSize}",
            request.PageNumber, request.PageSize);

        var cacheKey = string.Format(CacheKeyAllPrices, request.PageNumber, request.PageSize);
        var cached = await GetFromCacheAsync<PagedResult<PriceDto>>(cacheKey, cancellationToken);
        if (cached != null)
        {
            _logger.LogInformation("Cache HIT for prices list");
            return cached;
        }

        var (items, totalCount) = await _priceRepository.GetAllWithDetailsAsync(
            request.PageNumber, request.PageSize, cancellationToken);

        var result = new PagedResult<PriceDto>
        {
            Items = items.Select(p => p.ToDto()).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        await SetCacheAsync(cacheKey, result, ListCacheOptions, cancellationToken);
        return result;
    }

    /// <inheritdoc/>
    public async Task<PriceDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var price = await _priceRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ItemSupplierPrice), id);

        return price.ToDto();
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<PriceDto>> GetByItemIdAsync(Guid itemId, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(CacheKeyPricesByItem, itemId);
        var cached = await GetFromCacheAsync<List<PriceDto>>(cacheKey, cancellationToken);
        if (cached != null) return cached;

        var prices = await _priceRepository.GetByItemIdAsync(itemId, cancellationToken);
        var result = prices.Select(p => p.ToDto()).ToList();

        await SetCacheAsync(cacheKey, result, ListCacheOptions, cancellationToken);
        return result;
    }

    /// <inheritdoc/>
    public async Task<PriceDto> CreateAsync(CreatePriceRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating price record - ItemId: {ItemId}, SupplierId: {SupplierId}",
            request.ItemId, request.SupplierId);

        // Validate that the referenced Item exists
        var item = await _itemRepository.GetByIdAsync(request.ItemId, cancellationToken)
            ?? throw new NotFoundException(nameof(Item), request.ItemId);

        // Validate that the referenced Supplier exists
        var supplier = await _supplierRepository.GetByIdAsync(request.SupplierId, cancellationToken)
            ?? throw new NotFoundException(nameof(Supplier), request.SupplierId);

        // Check for duplicate Item + Supplier + EffectiveDate combination
        var isDuplicate = await _priceRepository.ExistsByItemSupplierDateAsync(
            request.ItemId, request.SupplierId, request.EffectiveDate.Date, null, cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException(
                $"A price record for item '{item.ItemCode}' with supplier '{supplier.SupplierCode}' " +
                $"on effective date '{request.EffectiveDate:yyyy-MM-dd}' already exists.");
        }

        var entity = request.ToEntity();
        await _priceRepository.AddAsync(entity, cancellationToken);
        await _priceRepository.SaveChangesAsync(cancellationToken);

        // Set navigation properties for DTO mapping (avoid extra DB round-trip)
        entity.Item = item;
        entity.Supplier = supplier;

        // Invalidate caches
        await InvalidatePriceCacheAsync(request.ItemId, cancellationToken);

        _logger.LogInformation("Price record created successfully with ID: {PriceId}", entity.Id);
        return entity.ToDto();
    }

    /// <inheritdoc/>
    public async Task<PriceDto> UpdateAsync(Guid id, UpdatePriceRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating price record with ID: {PriceId}", id);

        var entity = await _priceRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ItemSupplierPrice), id);

        // Optimistic concurrency check
        if (entity.RowVersion != request.RowVersion)
        {
            throw new ConflictException("The record has been modified by another user. Please refresh and try again.");
        }

        // Check for duplicate on the new effective date (excluding current record)
        var isDuplicate = await _priceRepository.ExistsByItemSupplierDateAsync(
            entity.ItemId, entity.SupplierId, request.EffectiveDate.Date, id, cancellationToken);

        if (isDuplicate)
        {
            throw new ConflictException(
                $"A price record for this item-supplier combination on effective date " +
                $"'{request.EffectiveDate:yyyy-MM-dd}' already exists.");
        }

        entity.Price = request.Price;
        entity.Currency = Enum.Parse<CurrencyCode>(request.Currency, true);
        entity.EffectiveDate = request.EffectiveDate.Date;
        entity.Remark = request.Remark?.Trim();

        _priceRepository.Update(entity);
        await _priceRepository.SaveChangesAsync(cancellationToken);

        await InvalidatePriceCacheAsync(entity.ItemId, cancellationToken);

        _logger.LogInformation("Price record updated successfully: {PriceId}", id);
        return entity.ToDto();
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Soft-deleting price record with ID: {PriceId}", id);

        var entity = await _priceRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(ItemSupplierPrice), id);

        var itemId = entity.ItemId;
        _priceRepository.SoftDelete(entity);
        await _priceRepository.SaveChangesAsync(cancellationToken);

        await InvalidatePriceCacheAsync(itemId, cancellationToken);

        _logger.LogInformation("Price record soft-deleted successfully: {PriceId}", id);
    }

    // ========================================
    // Redis cache helpers
    // ========================================

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
            _logger.LogWarning(ex, "Redis cache read failed for key: {CacheKey}", key);
            return null;
        }
    }

    private async Task SetCacheAsync<T>(string key, T value, DistributedCacheEntryOptions options, CancellationToken ct)
    {
        try
        {
            await _cache.SetStringAsync(key, JsonSerializer.Serialize(value), options, ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache write failed for key: {CacheKey}", key);
        }
    }

    private async Task InvalidatePriceCacheAsync(Guid itemId, CancellationToken ct)
    {
        try
        {
            await _cache.RemoveAsync(string.Format(CacheKeyAllPrices, 1, 100), ct);
            await _cache.RemoveAsync(string.Format(CacheKeyPricesByItem, itemId), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache invalidation failed for prices.");
        }
    }
}
