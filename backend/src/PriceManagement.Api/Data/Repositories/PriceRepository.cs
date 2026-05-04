using Microsoft.EntityFrameworkCore;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Interfaces;

namespace PriceManagement.Api.Data.Repositories;

/// <summary>
/// Price-specific repository implementation with eager loading and duplicate checking.
/// </summary>
public class PriceRepository : GenericRepository<ItemSupplierPrice>, IPriceRepository
{
    public PriceRepository(AppDbContext context) : base(context) { }

    /// <inheritdoc/>
    public async Task<(IReadOnlyList<ItemSupplierPrice> Items, int TotalCount)> GetAllWithDetailsAsync(
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(p => p.Item)
            .Include(p => p.Supplier)
            .OrderByDescending(p => p.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, totalCount);
    }

    /// <inheritdoc/>
    public async Task<IReadOnlyList<ItemSupplierPrice>> GetByItemIdAsync(Guid itemId, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .AsNoTracking()
            .Include(p => p.Item)
            .Include(p => p.Supplier)
            .Where(p => p.ItemId == itemId)
            .OrderByDescending(p => p.EffectiveDate)
            .ToListAsync(cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<bool> ExistsByItemSupplierDateAsync(
        Guid itemId,
        Guid supplierId,
        DateTime effectiveDate,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet.Where(p =>
            p.ItemId == itemId &&
            p.SupplierId == supplierId &&
            p.EffectiveDate.Date == effectiveDate.Date);

        // Exclude current record when checking for updates
        if (excludeId.HasValue)
        {
            query = query.Where(p => p.Id != excludeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
