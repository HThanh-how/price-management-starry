using Microsoft.EntityFrameworkCore;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Interfaces;

namespace PriceManagement.Api.Data.Repositories;

/// <summary>
/// Item-specific repository implementation with code lookup and eager loading.
/// </summary>
public class ItemRepository : GenericRepository<Item>, IItemRepository
{
    public ItemRepository(AppDbContext context) : base(context) { }

    /// <inheritdoc/>
    public async Task<Item?> GetByCodeAsync(string itemCode, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .FirstOrDefaultAsync(i => i.ItemCode == itemCode, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task<Item?> GetWithSupplierPricesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(i => i.ItemSupplierPrices.Where(isp => !isp.IsDeleted))
                .ThenInclude(isp => isp.Supplier)
            .FirstOrDefaultAsync(i => i.Id == id, cancellationToken);
    }
}
