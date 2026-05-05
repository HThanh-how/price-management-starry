namespace PriceManagement.Domain.Entities;

/// <summary>
/// Enterprise-grade audit trail record.
/// Automatically captures every data change across all entities.
/// Each row represents ONE field change — a single update touching 3 fields = 3 AuditLog rows.
/// </summary>
public class AuditLog
{
    /// <summary>
    /// Unique identifier (UUID).
    /// </summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Name of the entity/table that was modified (e.g., "Item", "Supplier", "ItemSupplierPrice").
    /// </summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// Primary key (ID) of the affected record.
    /// </summary>
    public string EntityId { get; set; } = string.Empty;

    /// <summary>
    /// Type of action: Created, Updated, Deleted.
    /// </summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Name of the field/property that was changed. Null for Create/Delete (applies to whole record).
    /// </summary>
    public string? FieldName { get; set; }

    /// <summary>
    /// Previous value before the change. Null for Created records.
    /// </summary>
    public string? OldValue { get; set; }

    /// <summary>
    /// New value after the change. Null for Deleted records.
    /// </summary>
    public string? NewValue { get; set; }

    /// <summary>
    /// Username or identifier of the person who made the change.
    /// </summary>
    public string ChangedBy { get; set; } = "system";

    /// <summary>
    /// UTC timestamp of the change.
    /// </summary>
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Client IP address from the HTTP request.
    /// </summary>
    public string? IpAddress { get; set; }

    /// <summary>
    /// Client User-Agent header (browser/device info).
    /// </summary>
    public string? UserAgent { get; set; }

    /// <summary>
    /// Correlation/Trace ID linking this audit entry to the API request.
    /// Enables end-to-end tracing across logs, API responses, and audit trail.
    /// </summary>
    public string? TraceId { get; set; }

    /// <summary>
    /// Optional JSON blob for additional context (e.g., batch operation details, reason for change).
    /// </summary>
    public string? AdditionalData { get; set; }
}
