using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.DTOs.Items;

namespace PriceManagement.Application.Services.Interfaces;

/// <summary>
/// Service interface for item business operations.
/// Abstracts business logic from the controller layer.
/// </summary>
public interface IItemService
{
    /// <summary>
    /// Retrieves a paginated list of items with optional search and sorting.
    /// </summary>
    Task<PagedResult<ItemDto>> GetAllAsync(PagedRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a single item by ID.
    /// </summary>
    Task<ItemDto> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves an item with all its linked supplier prices.
    /// Used for the item detail panel in the UI.
    /// </summary>
    Task<ItemDetailDto> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new item after validation.
    /// </summary>
    Task<ItemDto> CreateAsync(CreateItemRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing item with optimistic concurrency check.
    /// </summary>
    Task<ItemDto> UpdateAsync(Guid id, UpdateItemRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Soft-deletes an item by setting IsDeleted = true.
    /// </summary>
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
