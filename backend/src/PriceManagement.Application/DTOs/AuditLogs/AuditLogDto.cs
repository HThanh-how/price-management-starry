namespace PriceManagement.Application.DTOs.AuditLogs;

/// <summary>
/// DTO for returning audit log entries to the frontend.
/// </summary>
public class AuditLogDto
{
    public Guid Id { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? FieldName { get; set; }
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }
    public string ChangedBy { get; set; } = string.Empty;
    public DateTime ChangedAt { get; set; }
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
    public string? TraceId { get; set; }
}

/// <summary>
/// Query parameters for filtering audit logs.
/// </summary>
public class AuditLogQueryRequest
{
    public string EntityType { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string? Action { get; set; }
    public string? ChangedBy { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
