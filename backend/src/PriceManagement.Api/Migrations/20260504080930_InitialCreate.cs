using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PriceManagement.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false),
                    item_code = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    item_name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true),
                    unit = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false),
                    status = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    created_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    updated_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    row_version = table.Column<uint>(type: "int unsigned", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_items", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "suppliers",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false),
                    supplier_code = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    supplier_name = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false),
                    contact_person = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    email = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true),
                    phone = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: true),
                    address = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true),
                    status = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    created_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    updated_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    row_version = table.Column<uint>(type: "int unsigned", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_suppliers", x => x.id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "item_supplier_prices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false),
                    item_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    supplier_id = table.Column<Guid>(type: "char(36)", nullable: false),
                    price = table.Column<decimal>(type: "decimal(18,4)", nullable: false),
                    currency = table.Column<int>(type: "int", nullable: false),
                    effective_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    remark = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    created_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    updated_by = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true),
                    deleted_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    row_version = table.Column<uint>(type: "int unsigned", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_item_supplier_prices", x => x.id);
                    table.ForeignKey(
                        name: "FK_item_supplier_prices_items_item_id",
                        column: x => x.item_id,
                        principalTable: "items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_item_supplier_prices_suppliers_supplier_id",
                        column: x => x.supplier_id,
                        principalTable: "suppliers",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_isp_deleted_at",
                table: "item_supplier_prices",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_isp_item_id",
                table: "item_supplier_prices",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_isp_item_supplier_date",
                table: "item_supplier_prices",
                columns: new[] { "item_id", "supplier_id", "effective_date" });

            migrationBuilder.CreateIndex(
                name: "IX_isp_supplier_id",
                table: "item_supplier_prices",
                column: "supplier_id");

            migrationBuilder.CreateIndex(
                name: "IX_items_deleted_at",
                table: "items",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_items_item_code",
                table: "items",
                columns: new[] { "item_code", "deleted_at" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_items_status",
                table: "items",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_suppliers_deleted_at",
                table: "suppliers",
                column: "deleted_at");

            migrationBuilder.CreateIndex(
                name: "IX_suppliers_status",
                table: "suppliers",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_suppliers_supplier_code",
                table: "suppliers",
                columns: new[] { "supplier_code", "deleted_at" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "item_supplier_prices");

            migrationBuilder.DropTable(
                name: "items");

            migrationBuilder.DropTable(
                name: "suppliers");
        }
    }
}
