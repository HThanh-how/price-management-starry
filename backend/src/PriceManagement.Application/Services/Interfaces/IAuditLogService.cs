using PriceManagement.Application.DTOs.AuditLogs;
using PriceManagement.Application.DTOs.Common;

namespace PriceManagement.Application.Services.Interfaces;

/// <summary>
/// Service interface for querying audit trail records.
/// </summary>
public interface IAuditLogService
{
    /// <summary>
    /// Retrieves a paginated, filtered list of audit logs for a specific entity.
    /// </summary>
    Task<PagedResult<AuditLogDto>> GetByEntityAsync(AuditLogQueryRequest request, CancellationToken cancellationToken = default);
}
