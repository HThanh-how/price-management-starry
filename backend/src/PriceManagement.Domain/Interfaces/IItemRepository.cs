using PriceManagement.Domain.Entities;

namespace PriceManagement.Domain.Interfaces;

/// <summary>
/// Repository interface for Item-specific data access operations.
/// Extends generic repository with item-specific queries.
/// </summary>
public interface IItemRepository : IGenericRepository<Item>
{
    /// <summary>
    /// Retrieves an item by its business code.
    /// </summary>
    /// <param name="itemCode">The unique item code.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<Item?> GetByCodeAsync(string itemCode, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves an item with all its supplier price records eagerly loaded.
    /// Used for the item detail panel showing linked suppliers and prices.
    /// </summary>
    /// <param name="id">The UUID of the item.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<Item?> GetWithSupplierPricesAsync(Guid id, CancellationToken cancellationToken = default);
}
