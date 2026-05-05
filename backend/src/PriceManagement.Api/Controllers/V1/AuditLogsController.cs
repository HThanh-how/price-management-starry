using Microsoft.AspNetCore.Mvc;
using PriceManagement.Application.DTOs.AuditLogs;
using PriceManagement.Application.Services.Interfaces;

namespace PriceManagement.Api.Controllers.V1;

/// <summary>
/// API endpoints for querying the enterprise audit trail.
/// Read-only — audit entries are created automatically by AuditInterceptor.
/// </summary>
[ApiController]
[Route("api/v1/audit-logs")]
public class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    /// <summary>
    /// Retrieves paginated audit history for a specific entity.
    /// Example: GET /api/v1/audit-logs/Item/{itemId}?action=Updated
    /// </summary>
    [HttpGet("{entityType}/{entityId}")]
    public async Task<IActionResult> GetByEntity(
        string entityType,
        string entityId,
        [FromQuery] string? action = null,
        [FromQuery] string? changedBy = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var request = new AuditLogQueryRequest
        {
            EntityType = entityType,
            EntityId = entityId,
            Action = action,
            ChangedBy = changedBy,
            FromDate = fromDate,
            ToDate = toDate,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _auditLogService.GetByEntityAsync(request, cancellationToken);

        return Ok(new
        {
            success = true,
            code = 200,
            message = "Audit logs retrieved successfully",
            data = result,
            errors = (object?)null,
            traceId = HttpContext.TraceIdentifier
        });
    }
}
