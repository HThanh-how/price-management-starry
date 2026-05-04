using Microsoft.EntityFrameworkCore;
using PriceManagement.Domain.Entities;
using PriceManagement.Domain.Interfaces;

namespace PriceManagement.Api.Data.Repositories;

/// <summary>
/// Supplier-specific repository implementation with code lookup.
/// </summary>
public class SupplierRepository : GenericRepository<Supplier>, ISupplierRepository
{
    public SupplierRepository(AppDbContext context) : base(context) { }

    /// <inheritdoc/>
    public async Task<Supplier?> GetByCodeAsync(string supplierCode, CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(s => s.SupplierCode == supplierCode, cancellationToken);
    }
}
