using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data.Configurations;

/// <summary>
/// EF Core Fluent API configuration for the User entity.
/// Maps to 'users' table with unique email index.
/// </summary>
public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        // Primary key
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id)
            .HasColumnName("id");

        // Email — unique, required
        builder.Property(u => u.Email)
            .HasColumnName("email")
            .HasMaxLength(255)
            .IsRequired();

        builder.HasIndex(u => u.Email)
            .IsUnique()
            .HasDatabaseName("idx_users_email");

        // Password hash
        builder.Property(u => u.PasswordHash)
            .HasColumnName("password_hash")
            .HasMaxLength(255)
            .IsRequired();

        // Full name
        builder.Property(u => u.FullName)
            .HasColumnName("full_name")
            .HasMaxLength(200)
            .IsRequired();

        // Role
        builder.Property(u => u.Role)
            .HasColumnName("role")
            .HasMaxLength(50)
            .HasDefaultValue("Analyst");

        // Is active
        builder.Property(u => u.IsActive)
            .HasColumnName("is_active")
            .HasDefaultValue(true);

        // Last login
        builder.Property(u => u.LastLoginAt)
            .HasColumnName("last_login_at");

        // Base entity columns
        builder.Property(u => u.CreatedAt)
            .HasColumnName("created_at");

        builder.Property(u => u.UpdatedAt)
            .HasColumnName("updated_at");

        builder.Property(u => u.DeletedAt)
            .HasColumnName("deleted_at");

        builder.Property(u => u.RowVersion)
            .HasColumnName("row_version")
            .IsConcurrencyToken();

        // Soft delete filter
        builder.HasQueryFilter(u => u.DeletedAt == null);
    }
}
