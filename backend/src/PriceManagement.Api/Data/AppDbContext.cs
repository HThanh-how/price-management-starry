using Microsoft.EntityFrameworkCore;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data;

/// <summary>
/// Application database context with audit trail automation and soft delete global filters.
/// Overrides SaveChangesAsync to automatically set audit fields (CreatedAt, UpdatedAt, CreatedBy, UpdatedBy).
/// </summary>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // ========================================
    // DbSets
    // ========================================

    public DbSet<Item> Items => Set<Item>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<ItemSupplierPrice> ItemSupplierPrices => Set<ItemSupplierPrice>();

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
    /// Overrides SaveChangesAsync to automatically populate audit fields on all tracked entities.
    /// This ensures CreatedAt, UpdatedAt, CreatedBy, and UpdatedBy are consistently set
    /// without requiring manual assignment in every service method.
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

        return await base.SaveChangesAsync(cancellationToken);
    }
}
