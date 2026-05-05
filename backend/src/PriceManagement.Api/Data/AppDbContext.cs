using Microsoft.EntityFrameworkCore;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data;

/// <summary>
/// Application database context with audit trail automation and soft delete global filters.
/// Overrides SaveChangesAsync to automatically set audit fields (CreatedAt, UpdatedAt, CreatedBy, UpdatedBy).
/// Integrates AuditInterceptor for enterprise-grade change tracking.
/// </summary>
public class AppDbContext : DbContext
{
    private readonly AuditInterceptor? _auditInterceptor;

    public AppDbContext(DbContextOptions<AppDbContext> options, AuditInterceptor? auditInterceptor = null)
        : base(options)
    {
        _auditInterceptor = auditInterceptor;
    }

    // ========================================
    // DbSets
    // ========================================

    public DbSet<Item> Items => Set<Item>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<ItemSupplierPrice> ItemSupplierPrices => Set<ItemSupplierPrice>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    /// <summary>
    /// Configures entity relationships, indexes, constraints, and global query filters.
    /// </summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all entity configurations from the current assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // ========================================
        // Global query filters for soft delete
        // All queries automatically exclude soft-deleted records unless explicitly overridden
        // ========================================
        modelBuilder.Entity<Item>().HasQueryFilter(e => e.DeletedAt == null);
        modelBuilder.Entity<Supplier>().HasQueryFilter(e => e.DeletedAt == null);
        modelBuilder.Entity<ItemSupplierPrice>().HasQueryFilter(e => e.DeletedAt == null);
    }

    /// <summary>
    /// Overrides SaveChangesAsync to automatically populate audit fields on all tracked entities,
    /// then captures field-level changes via AuditInterceptor before persisting.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();
        var now = DateTime.UtcNow;

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.CreatedBy ??= "system";
                    break;

                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    entry.Entity.UpdatedBy ??= "system";
                    
                    // Increment RowVersion for optimistic concurrency control on MySQL
                    entry.Entity.RowVersion++;
                    
                    // Prevent modification of CreatedAt and CreatedBy on updates
                    entry.Property(e => e.CreatedAt).IsModified = false;
                    entry.Property(e => e.CreatedBy).IsModified = false;
                    break;
            }
        }

        // ========================================
        // Audit Trail: Capture changes BEFORE saving
        // ========================================
        List<AuditLog>? auditLogs = null;
        if (_auditInterceptor != null)
        {
            auditLogs = _auditInterceptor.CaptureChanges(ChangeTracker);
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        // ========================================
        // Audit Trail: Persist audit logs AFTER successful save
        // ========================================
        if (auditLogs != null && auditLogs.Count > 0)
        {
            AuditLogs.AddRange(auditLogs);
            await base.SaveChangesAsync(cancellationToken);
        }

        return result;
    }
}
