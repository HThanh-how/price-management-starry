using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PriceManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUserAuthentication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "base_price",
                table: "items",
                type: "decimal(18,4)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "category",
                table: "items",
                type: "varchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "metadata",
                table: "items",
                type: "json",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false),
                    entity_type = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    entity_id = table.Column<string>(type: "varchar(36)", maxLength: 36, nullable: false),
                    action = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    field_name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true),
                    old_value = table.Column<string>(type: "text", nullable: true),
                    new_value = table.Column<string>(type: "text", nullable: true),
                    changed_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    changed_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ip_address = table.Column<string>(type: "varchar(45)", maxLength: 45, nullable: true),
                    user_agent = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true),
                    trace_id = table.Column<string>(type: "varchar(36)", maxLength: 36, nullable: true),
                    additional_data = table.Column<string>(type: "json", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_audit_logs", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    full_name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    role = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false, defaultValue: "Analyst"),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false, defaultValue: true),
                    last_login_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedBy = table.Column<string>(type: "longtext", nullable: true),
                    UpdatedBy = table.Column<string>(type: "longtext", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    row_version = table.Column<uint>(type: "int unsigned", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_audit_action",
                table: "audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "IX_audit_changed_at",
                table: "audit_logs",
                column: "changed_at");

            migrationBuilder.CreateIndex(
                name: "IX_audit_entity_type_id",
                table: "audit_logs",
                columns: new[] { "entity_type", "entity_id" });

            migrationBuilder.CreateIndex(
                name: "IX_audit_trace_id",
                table: "audit_logs",
                column: "trace_id");

            migrationBuilder.CreateIndex(
                name: "idx_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "audit_logs");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropColumn(
                name: "base_price",
                table: "items");

            migrationBuilder.DropColumn(
                name: "category",
                table: "items");

            migrationBuilder.DropColumn(
                name: "metadata",
                table: "items");
        }
    }
}
