using System.Linq.Expressions;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Domain.Interfaces;

/// <summary>
/// Generic repository interface providing standard CRUD operations for all entities.
/// Implements the Repository pattern to abstract data access from business logic.
/// </summary>
/// <typeparam name="T">Entity type that inherits from BaseEntity.</typeparam>
public interface IGenericRepository<T> where T : BaseEntity
{
    /// <summary>
    /// Retrieves an entity by its unique identifier.
    /// Returns null if not found or soft-deleted.
    /// </summary>
    /// <param name="id">The UUID of the entity.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all non-deleted entities.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves entities matching a filter condition with optional sorting and pagination.
    /// </summary>
    /// <param name="filter">Expression to filter entities.</param>
    /// <param name="orderBy">Optional ordering function.</param>
    /// <param name="pageNumber">Page number (1-based).</param>
    /// <param name="pageSize">Number of records per page.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    Task<(IReadOnlyList<T> Items, int TotalCount)> GetPagedAsync(
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        int pageNumber = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds a new entity to the data store.
    /// </summary>
    /// <param name="entity">The entity to add.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing entity in the data store.
    /// </summary>
    /// <param name="entity">The entity with updated values.</param>
    void Update(T entity);

    /// <summary>
    /// Performs a soft delete on the entity by setting IsDeleted = true.
    /// The record remains in the database but is excluded from normal queries.
    /// </summary>
    /// <param name="entity">The entity to soft-delete.</param>
    void SoftDelete(T entity);

    /// <summary>
    /// Checks if any entity matches the specified condition.
    /// </summary>
    /// <param name="predicate">Condition to check.</param>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate, CancellationToken cancellationToken = default);

    /// <summary>
    /// Saves all pending changes to the data store.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token for async operation.</param>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
