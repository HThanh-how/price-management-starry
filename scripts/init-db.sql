CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
);

START TRANSACTION;
CREATE TABLE `items` (
    `id` char(36) NOT NULL,
    `item_code` varchar(50) NOT NULL,
    `item_name` varchar(200) NOT NULL,
    `description` varchar(1000) NULL,
    `unit` varchar(20) NOT NULL,
    `status` int NOT NULL,
    `created_at` datetime(6) NOT NULL,
    `updated_at` datetime(6) NULL,
    `created_by` varchar(100) NULL,
    `updated_by` varchar(100) NULL,
    `is_deleted` tinyint(1) NOT NULL DEFAULT FALSE,
    `row_version` int unsigned NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `suppliers` (
    `id` char(36) NOT NULL,
    `supplier_code` varchar(50) NOT NULL,
    `supplier_name` varchar(200) NOT NULL,
    `contact_person` varchar(100) NULL,
    `email` varchar(200) NULL,
    `phone` varchar(20) NULL,
    `address` varchar(500) NULL,
    `status` int NOT NULL,
    `created_at` datetime(6) NOT NULL,
    `updated_at` datetime(6) NULL,
    `created_by` varchar(100) NULL,
    `updated_by` varchar(100) NULL,
    `is_deleted` tinyint(1) NOT NULL DEFAULT FALSE,
    `row_version` int unsigned NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `item_supplier_prices` (
    `id` char(36) NOT NULL,
    `item_id` char(36) NOT NULL,
    `supplier_id` char(36) NOT NULL,
    `price` decimal(18,4) NOT NULL,
    `currency` int NOT NULL,
    `effective_date` datetime(6) NOT NULL,
    `remark` varchar(500) NULL,
    `created_at` datetime(6) NOT NULL,
    `updated_at` datetime(6) NULL,
    `created_by` varchar(100) NULL,
    `updated_by` varchar(100) NULL,
    `is_deleted` tinyint(1) NOT NULL DEFAULT FALSE,
    `row_version` int unsigned NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_item_supplier_prices_items_item_id` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_item_supplier_prices_suppliers_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT
);

CREATE INDEX `IX_isp_is_deleted` ON `item_supplier_prices` (`is_deleted`);

CREATE INDEX `IX_isp_item_id` ON `item_supplier_prices` (`item_id`);

CREATE INDEX `IX_isp_item_supplier_date` ON `item_supplier_prices` (`item_id`, `supplier_id`, `effective_date`);

CREATE INDEX `IX_isp_supplier_id` ON `item_supplier_prices` (`supplier_id`);

CREATE INDEX `IX_items_is_deleted` ON `items` (`is_deleted`);

CREATE UNIQUE INDEX `IX_items_item_code` ON `items` (`item_code`);

CREATE INDEX `IX_items_status` ON `items` (`status`);

CREATE INDEX `IX_suppliers_is_deleted` ON `suppliers` (`is_deleted`);

CREATE INDEX `IX_suppliers_status` ON `suppliers` (`status`);

CREATE UNIQUE INDEX `IX_suppliers_supplier_code` ON `suppliers` (`supplier_code`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260504070058_InitialCreate', '10.0.7');

COMMIT;

