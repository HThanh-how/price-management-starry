using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data.Configurations;

/// <summary>
/// EF Core Fluent API configuration for the Supplier entity.
/// </summary>
public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("suppliers");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .HasColumnType("char(36)");

        builder.Property(e => e.SupplierCode)
            .HasColumnName("supplier_code")
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(e => e.SupplierName)
            .HasColumnName("supplier_name")
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(e => e.ContactPerson)
            .HasColumnName("contact_person")
            .HasMaxLength(100);

        builder.Property(e => e.Email)
            .HasColumnName("email")
            .HasMaxLength(200);

        builder.Property(e => e.Phone)
            .HasColumnName("phone")
            .HasMaxLength(20);

        builder.Property(e => e.Address)
            .HasColumnName("address")
            .HasMaxLength(500);

        builder.Property(e => e.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        // Audit fields
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at");
        builder.Property(e => e.CreatedBy).HasColumnName("created_by").HasMaxLength(100);
        builder.Property(e => e.UpdatedBy).HasColumnName("updated_by").HasMaxLength(100);
        builder.Property(e => e.IsDeleted).HasColumnName("is_deleted").HasDefaultValue(false);

        builder.Property(e => e.RowVersion)
            .HasColumnName("row_version")
            .IsRowVersion();

        // Indexes
        builder.HasIndex(e => e.SupplierCode)
            .IsUnique()
            .HasDatabaseName("IX_suppliers_supplier_code");

        builder.HasIndex(e => e.Status)
            .HasDatabaseName("IX_suppliers_status");

        builder.HasIndex(e => e.IsDeleted)
            .HasDatabaseName("IX_suppliers_is_deleted");
    }
}
