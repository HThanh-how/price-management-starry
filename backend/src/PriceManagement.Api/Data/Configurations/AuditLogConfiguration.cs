using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PriceManagement.Domain.Entities;

namespace PriceManagement.Api.Data.Configurations;

/// <summary>
/// EF Core Fluent API configuration for the AuditLog entity.
/// </summary>
public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("audit_logs");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id)
            .HasColumnName("id")
            .HasColumnType("char(36)");

        builder.Property(e => e.EntityType)
            .HasColumnName("entity_type")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.EntityId)
            .HasColumnName("entity_id")
            .HasMaxLength(36)
            .IsRequired();

        builder.Property(e => e.Action)
            .HasColumnName("action")
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(e => e.FieldName)
            .HasColumnName("field_name")
            .HasMaxLength(200);

        builder.Property(e => e.OldValue)
            .HasColumnName("old_value")
            .HasColumnType("text");

        builder.Property(e => e.NewValue)
            .HasColumnName("new_value")
            .HasColumnType("text");

        builder.Property(e => e.ChangedBy)
            .HasColumnName("changed_by")
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.ChangedAt)
            .HasColumnName("changed_at")
            .IsRequired();

        builder.Property(e => e.IpAddress)
            .HasColumnName("ip_address")
            .HasMaxLength(45);

        builder.Property(e => e.UserAgent)
            .HasColumnName("user_agent")
            .HasMaxLength(500);

        builder.Property(e => e.TraceId)
            .HasColumnName("trace_id")
            .HasMaxLength(36);

        builder.Property(e => e.AdditionalData)
            .HasColumnName("additional_data")
            .HasColumnType("json");

        // ========================================
        // Indexes for query performance
        // ========================================

        // Primary query: "Show me all changes for entity X with ID Y"
        builder.HasIndex(e => new { e.EntityType, e.EntityId })
            .HasDatabaseName("IX_audit_entity_type_id");

        // Filter by action type
        builder.HasIndex(e => e.Action)
            .HasDatabaseName("IX_audit_action");

        // Time-range queries
        builder.HasIndex(e => e.ChangedAt)
            .HasDatabaseName("IX_audit_changed_at");

        // Trace correlation
        builder.HasIndex(e => e.TraceId)
            .HasDatabaseName("IX_audit_trace_id");
    }
}
