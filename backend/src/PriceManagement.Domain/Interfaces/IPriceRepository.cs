using PriceManagement.Domain.Entities;

namespace PriceManagement.Domain.Interfaces;

/// <summary>
/// Repository interface for ItemSupplierPrice-specific data access operations.
/// Extends generic repository with price-specific queries.
/// </summary>
public interface IPriceRepository : IGenericRepository<ItemSupplierPrice>
{
    /// <summary>
    /// Retrieves all price records with Item and Supplier navigation properties eagerly loaded.
    /// Used for the price list table that displays item names and supplier names.
    /// </summary>
    /// <param name="pageNumber">Page number (1-based).</param>
    /// <param name="pageSize">Number of records per page.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<(IReadOnlyList<ItemSupplierPrice> Items, int TotalCount)> GetAllWithDetailsAsync(
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all price records for a specific item, with supplier details loaded.
    /// Used for the item detail panel.
    /// </summary>
    /// <param name="itemId">The UUID of the item.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<IReadOnlyList<ItemSupplierPrice>> GetByItemIdAsync(Guid itemId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a price record already exists for the given Item + Supplier + EffectiveDate combination.
    /// Prevents duplicate pricing entries for the same effective date.
    /// </summary>
    /// <param name="itemId">The UUID of the item.</param>
    /// <param name="supplierId">The UUID of the supplier.</param>
    /// <param name="effectiveDate">The effective date to check.</param>
    /// <param name="excludeId">Optional ID to exclude (for update scenarios).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<bool> ExistsByItemSupplierDateAsync(
        Guid itemId,
        Guid supplierId,
        DateTime effectiveDate,
        Guid? excludeId = null,
        CancellationToken cancellationToken = default);
}
