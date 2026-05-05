using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PriceManagement.Api.Data;
using PriceManagement.Application.DTOs.AuditLogs;
using PriceManagement.Application.DTOs.Common;
using PriceManagement.Application.Services.Interfaces;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Services;

/// <summary>
/// Implementation of IAuditLogService.
/// Lives in the API layer because it directly queries AppDbContext (EF Core dependency).
/// </summary>
public class AuditLogService : IAuditLogService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(AppDbContext dbContext, ILogger<AuditLogService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    /// <inheritdoc/>
    public async Task<PagedResult<AuditLogDto>> GetByEntityAsync(
        AuditLogQueryRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Querying audit logs for {EntityType}:{EntityId}, Action={Action}, Page={Page}",
            request.EntityType, request.EntityId, request.Action, request.PageNumber);

        var query = _dbContext.AuditLogs.AsNoTracking()
            .Where(a => a.EntityType == request.EntityType && a.EntityId == request.EntityId);

        // Optional filters
        if (!string.IsNullOrWhiteSpace(request.Action))
            query = query.Where(a => a.Action == request.Action);

        if (!string.IsNullOrWhiteSpace(request.ChangedBy))
            query = query.Where(a => a.ChangedBy.Contains(request.ChangedBy));

        if (request.FromDate.HasValue)
            query = query.Where(a => a.ChangedAt >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(a => a.ChangedAt <= request.ToDate.Value);

        // Total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Sort by most recent first, then paginate
        var items = await query
            .OrderByDescending(a => a.ChangedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Action = a.Action,
                FieldName = a.FieldName,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                ChangedBy = a.ChangedBy,
                ChangedAt = a.ChangedAt,
                IpAddress = a.IpAddress,
                UserAgent = a.UserAgent,
                TraceId = a.TraceId
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<AuditLogDto>
        {
            Items = items,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            TotalCount = totalCount
        };
    }
}
