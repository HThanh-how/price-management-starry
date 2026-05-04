using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Suppliers;
using PriceManagement.Application.Mappings;
using PriceManagement.Application.Services.Interfaces;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Enums;
using PriceManagement.Domain.Exceptions;
using PriceManagement.Domain.Interfaces;

namespace PriceManagement.Application.Services.Implementations;

/// <summary>
/// Implementation of ISupplierService with Redis distributed caching.
/// </summary>
public class SupplierService : ISupplierService
{
    private readonly ISupplierRepository _supplierRepository;
    private readonly IDistributedCache _cache;
    private readonly ILogger<SupplierService> _logger;

    private const string CacheKeyAllSuppliers = "suppliers:all:{0}:{1}:{2}";
    private const string CacheKeySupplierById = "suppliers:id:{0}";

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

    public SupplierService(
        ISupplierRepository supplierRepository,
        IDistributedCache cache,
        ILogger<SupplierService> logger)
    {
        _supplierRepository = supplierRepository;
        _cache = cache;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<SupplierDto>> GetAllAsync(PagedRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Retrieving suppliers - Page: {PageNumber}, Size: {PageSize}, Search: {Search}",
            request.PageNumber, request.PageSize, request.Search);

        var cacheKey = string.Format(CacheKeyAllSuppliers, request.PageNumber, request.PageSize, request.Search ?? "");
        var cached = await GetFromCacheAsync<PagedResult<SupplierDto>>(cacheKey, cancellationToken);
        if (cached != null)
        {
            _logger.LogInformation("Cache HIT for suppliers list. Key: {CacheKey}", cacheKey);
            return cached;
        }

        System.Linq.Expressions.Expression<Func<Supplier, bool>>? filter = null;
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            filter = s => s.SupplierCode.ToLower().Contains(search) ||
                          s.SupplierName.ToLower().Contains(search) ||
                          (s.ContactPerson != null && s.ContactPerson.ToLower().Contains(search)) ||
                          (s.Email != null && s.Email.ToLower().Contains(search));
        }

        Func<IQueryable<Supplier>, IOrderedQueryable<Supplier>>? orderBy = request.SortBy?.ToLower() switch
        {
            "suppliercode" => request.SortDirection == "desc"
                ? q => q.OrderByDescending(s => s.SupplierCode)
                : q => q.OrderBy(s => s.SupplierCode),
            "suppliername" => request.SortDirection == "desc"
                ? q => q.OrderByDescending(s => s.SupplierName)
                : q => q.OrderBy(s => s.SupplierName),
            "createdat" => request.SortDirection == "desc"
                ? q => q.OrderByDescending(s => s.CreatedAt)
                : q => q.OrderBy(s => s.CreatedAt),
            _ => q => q.OrderByDescending(s => s.CreatedAt)
        };

        var (items, totalCount) = await _supplierRepository.GetPagedAsync(
            filter, orderBy, request.PageNumber, request.PageSize, cancellationToken);

        var result = new PagedResult<SupplierDto>
        {
            Items = items.Select(s => s.ToDto()).ToList(),
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };

        await SetCacheAsync(cacheKey, result, ListCacheOptions, cancellationToken);
        return result;
    }

    /// <inheritdoc/>
    public async Task<SupplierDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var cacheKey = string.Format(CacheKeySupplierById, id);
        var cached = await GetFromCacheAsync<SupplierDto>(cacheKey, cancellationToken);
        if (cached != null) return cached;

        var supplier = await _supplierRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Supplier), id);

        var dto = supplier.ToDto();
        await SetCacheAsync(cacheKey, dto, ItemCacheOptions, cancellationToken);
        return dto;
    }

    /// <inheritdoc/>
    public async Task<SupplierDto> CreateAsync(CreateSupplierRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating new supplier with code: {SupplierCode}", request.SupplierCode);

        // Check for duplicate supplier code
        var existing = await _supplierRepository.GetByCodeAsync(request.SupplierCode.Trim(), cancellationToken);
        if (existing != null)
        {
            throw new ConflictException($"Supplier with code '{request.SupplierCode}' already exists.");
        }

        var entity = request.ToEntity();
        await _supplierRepository.AddAsync(entity, cancellationToken);
        await _supplierRepository.SaveChangesAsync(cancellationToken);

        await InvalidateListCacheAsync(cancellationToken);

        _logger.LogInformation("Supplier created successfully with ID: {SupplierId}", entity.Id);
        return entity.ToDto();
    }

    /// <inheritdoc/>
    public async Task<SupplierDto> UpdateAsync(Guid id, UpdateSupplierRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating supplier with ID: {SupplierId}", id);

        var entity = await _supplierRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Supplier), id);

        // Optimistic concurrency check
        if (entity.RowVersion != request.RowVersion)
        {
            throw new ConflictException("The record has been modified by another user. Please refresh and try again.");
        }

        entity.SupplierName = request.SupplierName.Trim();
        entity.ContactPerson = request.ContactPerson?.Trim();
        entity.Email = request.Email?.Trim();
        entity.Phone = request.Phone?.Trim();
        entity.Address = request.Address?.Trim();
        entity.Status = Enum.Parse<EntityStatus>(request.Status, true);

        _supplierRepository.Update(entity);
        await _supplierRepository.SaveChangesAsync(cancellationToken);

        await InvalidateSupplierCacheAsync(id, cancellationToken);

        _logger.LogInformation("Supplier updated successfully: {SupplierId}", id);
        return entity.ToDto();
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Soft-deleting supplier with ID: {SupplierId}", id);

        var entity = await _supplierRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException(nameof(Supplier), id);

        _supplierRepository.SoftDelete(entity);
        await _supplierRepository.SaveChangesAsync(cancellationToken);

        await InvalidateSupplierCacheAsync(id, cancellationToken);

        _logger.LogInformation("Supplier soft-deleted successfully: {SupplierId}", id);
    }

    // ========================================
    // Redis cache helpers (cache-aside pattern, graceful degradation)
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

    private async Task InvalidateSupplierCacheAsync(Guid id, CancellationToken ct)
    {
        try
        {
            await _cache.RemoveAsync(string.Format(CacheKeySupplierById, id), ct);
            await _cache.RemoveAsync(string.Format(CacheKeyAllSuppliers, 1, 100, ""), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache invalidation failed for supplier: {SupplierId}", id);
        }
    }

    private async Task InvalidateListCacheAsync(CancellationToken ct)
    {
        try
        {
            await _cache.RemoveAsync(string.Format(CacheKeyAllSuppliers, 1, 100, ""), ct);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Redis cache invalidation failed for suppliers list.");
        }
    }
}
