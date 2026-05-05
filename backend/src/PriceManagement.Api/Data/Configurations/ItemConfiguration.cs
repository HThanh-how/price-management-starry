using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data.Configurations;

/// <summary>
/// EF Core Fluent API configuration for the Item entity.
/// Defines table structure, indexes, and constraints.
/// </summary>
public class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.ToTable("items");

        // Primary key
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .HasColumnType("char(36)");

        // Business fields
        builder.Property(e => e.ItemCode)
            .HasColumnName("item_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.ItemName)
            .HasColumnName("item_name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnName("description")
            .HasMaxLength(1000);

        builder.Property(e => e.Unit)
            .HasColumnName("unit")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(e => e.Category)
            .HasColumnName("category")
            .HasMaxLength(100);

        builder.Property(e => e.BasePrice)
            .HasColumnName("base_price")
            .HasColumnType("decimal(18,4)");

        builder.Property(e => e.Metadata)
            .HasColumnName("metadata")
            .HasColumnType("json");

        builder.Property(e => e.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        // Audit fields
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        builder.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
        builder.Property(e => e.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);

        // Soft delete
        builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");

        // Optimistic concurrency token
        builder.Property(e => e.RowVersion)
            .HasColumnName("row_version")
            .IsConcurrencyToken();

        // ========================================
        // Indexes for query performance
        // ========================================

        // Unique index on ItemCode and DeletedAt (allows multiple soft-deleted, but only one active)
        builder.HasIndex(e => new { e.ItemCode, e.DeletedAt })
            .IsUnique()
            .HasDatabaseName("IX_items_item_code");

        // Index for status filtering (common query pattern)
        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_items_status");

        // Index for soft delete filtering
        builder.HasIndex(e => e.DeletedAt)
            .HasDatabaseName("IX_items_deleted_at");
    }
}
