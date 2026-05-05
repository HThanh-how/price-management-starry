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
    `category` varchar(100) NULL,
    `base_price` decimal(18,4) NULL,
    `metadata` json NULL,
    `status` int NOT NULL,
    `created_at` datetime(6) NOT NULL,
    `updated_at` datetime(6) NULL,
    `created_by` varchar(100) NULL,
    `updated_by` varchar(100) NULL,
    `deleted_at` datetime(6) NULL,
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
    `deleted_at` datetime(6) NULL,
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
    `deleted_at` datetime(6) NULL,
    `row_version` int unsigned NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_item_supplier_prices_items_item_id` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT,
    CONSTRAINT `FK_item_supplier_prices_suppliers_supplier_id` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT
);

CREATE INDEX `IX_isp_deleted_at` ON `item_supplier_prices` (`deleted_at`);

CREATE INDEX `IX_isp_item_id` ON `item_supplier_prices` (`item_id`);

CREATE INDEX `IX_isp_item_supplier_date` ON `item_supplier_prices` (`item_id`, `supplier_id`, `effective_date`);

CREATE INDEX `IX_isp_supplier_id` ON `item_supplier_prices` (`supplier_id`);

CREATE INDEX `IX_items_deleted_at` ON `items` (`deleted_at`);

CREATE UNIQUE INDEX `IX_items_item_code` ON `items` (`item_code`, `deleted_at`);

CREATE INDEX `IX_items_status` ON `items` (`status`);

CREATE INDEX `IX_suppliers_deleted_at` ON `suppliers` (`deleted_at`);

CREATE INDEX `IX_suppliers_status` ON `suppliers` (`status`);

CREATE UNIQUE INDEX `IX_suppliers_supplier_code` ON `suppliers` (`supplier_code`, `deleted_at`);

INSERT INTO `__EFMigrationsHistory` (`MigrationId`, `ProductVersion`)
VALUES ('20260504080930_InitialCreate', '10.0.7');

CREATE TABLE `audit_logs` (
    `id` char(36) NOT NULL,
    `entity_type` varchar(100) NOT NULL,
    `entity_id` varchar(36) NOT NULL,
    `action` varchar(20) NOT NULL,
    `field_name` varchar(200) NULL,
    `old_value` text NULL,
    `new_value` text NULL,
    `changed_by` varchar(100) NOT NULL DEFAULT 'system',
    `changed_at` datetime(6) NOT NULL,
    `ip_address` varchar(45) NULL,
    `user_agent` varchar(500) NULL,
    `trace_id` varchar(36) NULL,
    `additional_data` json NULL,
    PRIMARY KEY (`id`)
);

CREATE INDEX `IX_audit_entity_type_id` ON `audit_logs` (`entity_type`, `entity_id`);
CREATE INDEX `IX_audit_action` ON `audit_logs` (`action`);
CREATE INDEX `IX_audit_changed_at` ON `audit_logs` (`changed_at`);
CREATE INDEX `IX_audit_trace_id` ON `audit_logs` (`trace_id`);

COMMIT;

