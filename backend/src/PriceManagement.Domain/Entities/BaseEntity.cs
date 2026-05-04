namespace PriceManagement.Domain.Entities;

/// <summary>
/// Base entity with common audit fields, soft delete, and optimistic concurrency support.
/// All entities inherit from this to ensure consistent behavior across the domain.
/// </summary>
public abstract class BaseEntity
{
    /// <summary>
    /// Unique identifier using UUID (Guid) for distributed-safe primary keys.
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Timestamp when the record was first created (UTC).
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Timestamp when the record was last updated (UTC). Null if never updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Identifier of the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Identifier of the user who last updated the record.
    /// </summary>
    public string? UpdatedBy { get; set; }

    /// <summary>
    /// Soft delete flag. When true, the record is logically deleted but still exists in the database.
    /// Global query filters automatically exclude soft-deleted records from normal queries.
    /// </summary>
    public bool IsDeleted { get; set; } = false;

    /// <summary>
    /// Concurrency token for optimistic concurrency control.
    /// EF Core automatically checks this value during updates to prevent lost updates.
    /// </summary>
    public uint RowVersion { get; set; }
}
