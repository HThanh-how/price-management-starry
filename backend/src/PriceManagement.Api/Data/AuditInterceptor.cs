using System.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data;

/// <summary>
/// Enterprise Audit Interceptor.
/// Hooks into EF Core ChangeTracker to automatically capture every field-level change
/// across all BaseEntity-derived entities (Item, Supplier, ItemSupplierPrice).
/// 
/// Architecture:
///   - Runs BEFORE SaveChangesAsync to snapshot original values.
///   - Runs AFTER SaveChangesAsync to capture DB-generated values (for Created entities).
///   - Each changed property = 1 AuditLog row (granular field-level tracking).
/// </summary>
public class AuditInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AuditInterceptor(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Captures all pending changes and returns AuditLog entries to be saved.
    /// Call this BEFORE base.SaveChangesAsync().
    /// </summary>
    public List<AuditLog> CaptureChanges(ChangeTracker changeTracker)
    {
        var auditLogs = new List<AuditLog>();
        var httpContext = _httpContextAccessor.HttpContext;

        var changedBy = httpContext?.User?.Identity?.Name ?? "system";
        var ipAddress = httpContext?.Connection?.RemoteIpAddress?.ToString();
        var userAgent = httpContext?.Request?.Headers["User-Agent"].FirstOrDefault();
        var traceId = Activity.Current?.TraceId.ToString()
                      ?? httpContext?.TraceIdentifier;

        var now = DateTime.UtcNow;

        // Only audit BaseEntity-derived entities (skip AuditLog itself to avoid infinite recursion)
        var entries = changeTracker.Entries<BaseEntity>()
            .Where(e => e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            var entityType = entry.Entity.GetType().Name;
            var entityId = entry.Entity.Id.ToString();

            switch (entry.State)
            {
                case EntityState.Added:
                    auditLogs.Add(new AuditLog
                    {
                        EntityType = entityType,
                        EntityId = entityId,
                        Action = "Created",
                        FieldName = "Record Creation",
                        OldValue = null,
                        NewValue = "Initial Setup Complete",
                        ChangedBy = changedBy,
                        ChangedAt = now,
                        IpAddress = ipAddress,
                        UserAgent = userAgent,
                        TraceId = traceId
                    });
                    break;

                case EntityState.Modified:
                    foreach (var prop in entry.Properties)
                    {
                        // Skip audit/system fields
                        if (IsSystemField(prop.Metadata.Name)) continue;

                        if (!prop.IsModified) continue;

                        var originalValue = prop.OriginalValue?.ToString();
                        var currentValue = prop.CurrentValue?.ToString();

                        // Skip if value didn't actually change
                        if (originalValue == currentValue) continue;

                        auditLogs.Add(new AuditLog
                        {
                            EntityType = entityType,
                            EntityId = entityId,
                            Action = "Updated",
                            FieldName = prop.Metadata.Name,
                            OldValue = originalValue,
                            NewValue = currentValue,
                            ChangedBy = changedBy,
                            ChangedAt = now,
                            IpAddress = ipAddress,
                            UserAgent = userAgent,
                            TraceId = traceId
                        });
                    }
                    break;

                case EntityState.Deleted:
                    auditLogs.Add(new AuditLog
                    {
                        EntityType = entityType,
                        EntityId = entityId,
                        Action = "Deleted",
                        FieldName = null,
                        OldValue = null,
                        NewValue = null,
                        ChangedBy = changedBy,
                        ChangedAt = now,
                        IpAddress = ipAddress,
                        UserAgent = userAgent,
                        TraceId = traceId
                    });
                    break;
            }
        }

        // Also detect soft-deletes (DeletedAt changed from null to a value)
        var softDeletes = changeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified
                        && e.Property(p => p.DeletedAt).IsModified
                        && e.Property(p => p.DeletedAt).CurrentValue != null
                        && e.Property(p => p.DeletedAt).OriginalValue == null)
            .ToList();

        foreach (var entry in softDeletes)
        {
            // Check if we already added "Updated" entries for DeletedAt — replace with "Deleted" action
            var entityId = entry.Entity.Id.ToString();
            var entityType = entry.Entity.GetType().Name;
            auditLogs.RemoveAll(a => a.EntityId == entityId && a.FieldName == "DeletedAt");
            auditLogs.Add(new AuditLog
            {
                EntityType = entityType,
                EntityId = entityId,
                Action = "Deleted",
                FieldName = "Soft Delete",
                OldValue = "Active",
                NewValue = "Deleted",
                ChangedBy = changedBy,
                ChangedAt = now,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                TraceId = traceId
            });
        }

        return auditLogs;
    }

    /// <summary>
    /// System/audit fields that should NOT generate audit log entries.
    /// </summary>
    private static bool IsSystemField(string fieldName) =>
        fieldName is "CreatedAt" or "UpdatedAt" or "CreatedBy" or "UpdatedBy"
                  or "DeletedAt" or "RowVersion" or "Id";
}
