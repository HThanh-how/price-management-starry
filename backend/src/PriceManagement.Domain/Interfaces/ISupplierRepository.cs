using PriceManagement.Domain.Entities;

namespace PriceManagement.Domain.Interfaces;

/// <summary>
/// Repository interface for Supplier-specific data access operations.
/// Extends generic repository with supplier-specific queries.
/// </summary>
public interface ISupplierRepository : IGenericRepository<Supplier>
{
    /// <summary>
    /// Retrieves a supplier by its business code.
    /// </summary>
    /// <param name="supplierCode">The unique supplier code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<Supplier?> GetByCodeAsync(string supplierCode, CancellationToken cancellationToken = default);
}
