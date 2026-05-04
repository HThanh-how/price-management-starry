using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data.Configurations;

/// <summary>
/// EF Core Fluent API configuration for the ItemSupplierPrice junction entity.
/// Defines the many-to-many relationship between Item and Supplier with price data.
/// </summary>
public class ItemSupplierPriceConfiguration : IEntityTypeConfiguration<ItemSupplierPrice>
{
    public void Configure(EntityTypeBuilder<ItemSupplierPrice> builder)
    {
        builder.ToTable("item_supplier_prices");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .HasColumnType("char(36)");

        // Foreign keys
        builder.Property(e => e.ItemId)
            .HasColumnName("item_id")
            .HasColumnType("char(36)")
            .IsRequired();

        builder.Property(e => e.SupplierId)
            .HasColumnName("supplier_id")
            .HasColumnType("char(36)")
            .IsRequired();

        // Price with high precision for financial data
        builder.Property(e => e.Price)
            .HasColumnName("price")
            .HasColumnType("decimal(18,4)")
            .IsRequired();

        builder.Property(e => e.Currency)
            .HasColumnName("currency")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(e => e.EffectiveDate)
            .HasColumnName("effective_date")
            .IsRequired();

        builder.Property(e => e.Remark)
            .HasColumnName("remark")
            .HasMaxLength(500);

        // Audit fields
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        builder.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
        builder.Property(e => e.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
        builder.Property(e => e.DeletedAt).HasColumnName("deleted_at");

        builder.Property(e => e.RowVersion)
            .HasColumnName("row_version")
            .IsConcurrencyToken();

        // ========================================
        // Relationships
        // ========================================

        builder.HasOne(e => e.Item)
            .WithMany(i => i.ItemSupplierPrices)
            .HasForeignKey(e => e.ItemId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        builder.HasOne(e => e.Supplier)
            .WithMany(s => s.ItemSupplierPrices)
            .HasForeignKey(e => e.SupplierId)
            .OnDelete(DeleteBehavior.Restrict); // Prevent cascade delete

        // ========================================
        // Indexes
        // ========================================

        // Composite index for duplicate checking (Item + Supplier + EffectiveDate)
        builder.HasIndex(e => new { e.ItemId, e.SupplierId, e.EffectiveDate })
            .HasDatabaseName("IX_isp_item_supplier_date");

        // Index for querying prices by item (used in item detail panel)
        builder.HasIndex(e => e.ItemId)
            .HasDatabaseName("IX_isp_item_id");

        // Index for querying prices by supplier
        builder.HasIndex(e => e.SupplierId)
            .HasDatabaseName("IX_isp_supplier_id");

        builder.HasIndex(e => e.DeletedAt)
            .HasDatabaseName("IX_isp_deleted_at");
    }
}
