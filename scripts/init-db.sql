-- =============================================
-- Price Management System — Database Schema & Sample Data
-- Enterprise-grade initialization script
-- =============================================

CREATE TABLE IF NOT EXISTS `__EFMigrationsHistory` (
    `MigrationId` varchar(150) NOT NULL,
    `ProductVersion` varchar(32) NOT NULL,
    PRIMARY KEY (`MigrationId`)
);

START TRANSACTION;

-- =============================================
-- Items (Master Item List)
-- =============================================
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

-- =============================================
-- Suppliers (Master Supplier List)
-- =============================================
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

-- =============================================
-- Item-Supplier Prices
-- =============================================
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

-- =============================================
-- Audit Logs
-- =============================================
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

-- =============================================
-- Users (Authentication)
-- =============================================
CREATE TABLE IF NOT EXISTS `users` (
    `id` char(36) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password_hash` varchar(255) NOT NULL,
    `full_name` varchar(200) NOT NULL,
    `role` varchar(50) NOT NULL DEFAULT 'Analyst',
    `is_active` tinyint(1) NOT NULL DEFAULT 1,
    `last_login_at` datetime(6) NULL,
    `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6) NULL,
    `created_by` varchar(100) NULL,
    `updated_by` varchar(100) NULL,
    `deleted_at` datetime(6) NULL,
    `row_version` int unsigned NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
);

-- =============================================
-- Indexes
-- =============================================
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
CREATE INDEX `IX_audit_entity_type_id` ON `audit_logs` (`entity_type`, `entity_id`);
CREATE INDEX `IX_audit_action` ON `audit_logs` (`action`);
CREATE INDEX `IX_audit_changed_at` ON `audit_logs` (`changed_at`);
CREATE INDEX `IX_audit_trace_id` ON `audit_logs` (`trace_id`);
CREATE UNIQUE INDEX `idx_users_email` ON `users` (`email`);

-- =============================================
-- SAMPLE DATA: Items (10 items across categories)
-- =============================================
INSERT INTO `items` (`id`, `item_code`, `item_name`, `description`, `unit`, `category`, `base_price`, `metadata`, `status`, `created_at`, `row_version`) VALUES
('11111111-1111-1111-1111-111111111101', 'ITM-001', 'Gạo ST25 Premium', 'Gạo ST25 hữu cơ đạt chuẩn xuất khẩu, bao 25kg', 'kg', 'Lương thực', 28000.0000, '{"origin": "Sóc Trăng", "organic": true, "packaging": "25kg bag"}', 0, '2026-01-15 08:00:00.000000', 0),
('11111111-1111-1111-1111-111111111102', 'ITM-002', 'Đường RE Biên Hòa', 'Đường tinh luyện RE, bao 50kg', 'kg', 'Lương thực', 22500.0000, '{"brand": "Biên Hòa", "type": "refined", "packaging": "50kg bag"}', 0, '2026-01-15 08:00:00.000000', 0),
('11111111-1111-1111-1111-111111111103', 'ITM-003', 'Dầu ăn Neptune 5L', 'Dầu ăn Neptune Gold chai 5 lít', 'chai', 'Dầu ăn', 185000.0000, '{"brand": "Neptune", "volume": "5L", "type": "vegetable oil"}', 0, '2026-01-20 09:00:00.000000', 0),
('11111111-1111-1111-1111-111111111104', 'ITM-004', 'Nước mắm Phú Quốc 40°', 'Nước mắm cá cơm Phú Quốc 40 độ đạm, chai 500ml', 'chai', 'Gia vị', 65000.0000, '{"origin": "Phú Quốc", "protein_degree": 40, "volume": "500ml"}', 0, '2026-01-20 09:00:00.000000', 0),
('11111111-1111-1111-1111-111111111105', 'ITM-005', 'Thép cuộn cán nóng HRC', 'Thép cuộn cán nóng HRC Q235B, độ dày 2mm', 'tấn', 'Vật liệu xây dựng', 14500000.0000, '{"grade": "Q235B", "thickness_mm": 2, "standard": "JIS G3101"}', 0, '2026-02-01 10:00:00.000000', 0),
('11111111-1111-1111-1111-111111111106', 'ITM-006', 'Xi măng Hà Tiên PCB40', 'Xi măng Portland hỗn hợp PCB40, bao 50kg', 'bao', 'Vật liệu xây dựng', 95000.0000, '{"brand": "Hà Tiên", "type": "PCB40", "weight": "50kg"}', 0, '2026-02-01 10:00:00.000000', 0),
('11111111-1111-1111-1111-111111111107', 'ITM-007', 'Laptop Dell Latitude 5540', 'Laptop Dell Latitude 5540 i7-1365U/16GB/512GB', 'cái', 'Thiết bị IT', 28500000.0000, '{"cpu": "i7-1365U", "ram": "16GB", "storage": "512GB SSD", "warranty": "3 years"}', 0, '2026-02-10 08:30:00.000000', 0),
('11111111-1111-1111-1111-111111111108', 'ITM-008', 'Giấy A4 Double A 80gsm', 'Giấy in A4 Double A 80gsm, ream 500 tờ', 'ream', 'Văn phòng phẩm', 85000.0000, '{"brand": "Double A", "gsm": 80, "sheets": 500}', 0, '2026-02-10 08:30:00.000000', 0),
('11111111-1111-1111-1111-111111111109', 'ITM-009', 'Cà phê Robusta rang xay', 'Cà phê Robusta Đắk Lắk rang mộc, gói 500g', 'gói', 'Thực phẩm', 120000.0000, '{"origin": "Đắk Lắk", "type": "Robusta", "roast": "medium", "weight": "500g"}', 0, '2026-03-01 07:00:00.000000', 0),
('11111111-1111-1111-1111-111111111110', 'ITM-010', 'Găng tay cao su y tế', 'Găng tay cao su y tế không bột, hộp 100 cái, size M', 'hộp', 'Y tế', 95000.0000, '{"material": "nitrile", "powdered": false, "size": "M", "quantity": 100}', 0, '2026-03-01 07:00:00.000000', 0);

-- =============================================
-- SAMPLE DATA: Suppliers (6 suppliers)
-- =============================================
INSERT INTO `suppliers` (`id`, `supplier_code`, `supplier_name`, `contact_person`, `email`, `phone`, `address`, `status`, `created_at`, `row_version`) VALUES
('22222222-2222-2222-2222-222222222201', 'SUP-001', 'Công ty TNHH Thương mại Phú Thịnh', 'Nguyễn Văn Minh', 'minh.nguyen@phuthinh.vn', '0901234567', '123 Nguyễn Huệ, Q.1, TP.HCM', 0, '2026-01-10 08:00:00.000000', 0),
('22222222-2222-2222-2222-222222222202', 'SUP-002', 'Công ty CP Vật liệu Xây dựng Miền Nam', 'Trần Thị Hoa', 'hoa.tran@vlxdmiennam.com', '0912345678', '456 Lý Thường Kiệt, Q.10, TP.HCM', 0, '2026-01-10 08:00:00.000000', 0),
('22222222-2222-2222-2222-222222222203', 'SUP-003', 'Công ty TNHH Công nghệ Starlight', 'Lê Hoàng Nam', 'nam.le@starlight.tech', '0923456789', '789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', 0, '2026-01-15 09:00:00.000000', 0),
('22222222-2222-2222-2222-222222222204', 'SUP-004', 'Công ty CP Nông sản Đồng Tháp', 'Phạm Minh Tuấn', 'tuan.pham@nongsandt.vn', '0934567890', '12 Trần Hưng Đạo, TX.Sa Đéc, Đồng Tháp', 0, '2026-01-15 09:00:00.000000', 0),
('22222222-2222-2222-2222-222222222205', 'SUP-005', 'Công ty TNHH Thiết bị Y tế Sài Gòn', 'Võ Thị Mai', 'mai.vo@saigonmed.vn', '0945678901', '321 Cách Mạng Tháng 8, Q.3, TP.HCM', 0, '2026-02-01 10:00:00.000000', 0),
('22222222-2222-2222-2222-222222222206', 'SUP-006', 'Công ty CP XNK Tổng hợp Vinaglobal', 'Đỗ Quang Huy', 'huy.do@vinaglobal.com', '0956789012', '99 Pasteur, Q.1, TP.HCM', 0, '2026-02-01 10:00:00.000000', 0);

-- =============================================
-- SAMPLE DATA: Item-Supplier Prices (18 records)
-- currency: 0 = VND, 1 = USD
-- =============================================
INSERT INTO `item_supplier_prices` (`id`, `item_id`, `supplier_id`, `price`, `currency`, `effective_date`, `remark`, `created_at`, `row_version`) VALUES
-- Gạo ST25: 2 nhà cung cấp
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', 26500.0000, 0, '2026-01-20 00:00:00.000000', 'Giá sỉ từ 100kg, giao tận kho', '2026-01-20 08:00:00.000000', 0),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222204', 25800.0000, 0, '2026-01-25 00:00:00.000000', 'Mua trực tiếp từ nông trại, giá tốt nhất', '2026-01-25 08:00:00.000000', 0),
-- Đường RE: 2 nhà cung cấp
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222201', 21800.0000, 0, '2026-02-01 00:00:00.000000', 'Hợp đồng quý, thanh toán 30 ngày', '2026-02-01 08:00:00.000000', 0),
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222206', 22000.0000, 0, '2026-02-01 00:00:00.000000', 'Nhập khẩu, giá CIF HCM', '2026-02-01 08:00:00.000000', 0),
-- Dầu ăn Neptune: 1 nhà cung cấp
('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222201', 178000.0000, 0, '2026-02-10 00:00:00.000000', 'Đại lý cấp 1, chiết khấu 3%', '2026-02-10 08:00:00.000000', 0),
-- Nước mắm Phú Quốc: 2 nhà cung cấp
('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222204', 58000.0000, 0, '2026-02-15 00:00:00.000000', 'Hàng chính hãng, tem chống giả', '2026-02-15 08:00:00.000000', 0),
('33333333-3333-3333-3333-333333333307', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222206', 62000.0000, 0, '2026-02-15 00:00:00.000000', 'Phiên bản xuất khẩu, chất lượng cao', '2026-02-15 08:00:00.000000', 0),
-- Thép HRC: 2 nhà cung cấp (VND + USD)
('33333333-3333-3333-3333-333333333308', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222202', 14200000.0000, 0, '2026-03-01 00:00:00.000000', 'Hòa Phát, giao tại nhà máy', '2026-03-01 08:00:00.000000', 0),
('33333333-3333-3333-3333-333333333309', '11111111-1111-1111-1111-111111111105', '22222222-2222-2222-2222-222222222206', 560.0000, 1, '2026-03-01 00:00:00.000000', 'Nhập khẩu Trung Quốc, FOB Hải Phòng', '2026-03-01 08:00:00.000000', 0),
-- Xi măng: 1 nhà cung cấp
('33333333-3333-3333-3333-333333333310', '11111111-1111-1111-1111-111111111106', '22222222-2222-2222-2222-222222222202', 92000.0000, 0, '2026-03-05 00:00:00.000000', 'Mua từ 500 bao trở lên', '2026-03-05 08:00:00.000000', 0),
-- Laptop Dell: 2 nhà cung cấp
('33333333-3333-3333-3333-333333333311', '11111111-1111-1111-1111-111111111107', '22222222-2222-2222-2222-222222222203', 27800000.0000, 0, '2026-03-10 00:00:00.000000', 'Đại lý ủy quyền Dell, bảo hành 3 năm onsite', '2026-03-10 08:00:00.000000', 0),
('33333333-3333-3333-3333-333333333312', '11111111-1111-1111-1111-111111111107', '22222222-2222-2222-2222-222222222206', 1120.0000, 1, '2026-03-10 00:00:00.000000', 'Nhập trực tiếp từ Dell Singapore', '2026-03-10 08:00:00.000000', 0),
-- Giấy A4: 1 nhà cung cấp
('33333333-3333-3333-3333-333333333313', '11111111-1111-1111-1111-111111111108', '22222222-2222-2222-2222-222222222203', 79000.0000, 0, '2026-03-15 00:00:00.000000', 'Mua từ 50 ream, miễn phí vận chuyển nội thành', '2026-03-15 08:00:00.000000', 0),
-- Cà phê Robusta: 2 nhà cung cấp
('33333333-3333-3333-3333-333333333314', '11111111-1111-1111-1111-111111111109', '22222222-2222-2222-2222-222222222204', 110000.0000, 0, '2026-03-20 00:00:00.000000', 'Thu mua trực tiếp từ vườn, rang xay thủ công', '2026-03-20 08:00:00.000000', 0),
('33333333-3333-3333-3333-333333333315', '11111111-1111-1111-1111-111111111109', '22222222-2222-2222-2222-222222222206', 4.50, 1, '2026-03-20 00:00:00.000000', 'Giá xuất khẩu FOB HCM, min 1 container', '2026-03-20 08:00:00.000000', 0),
-- Găng tay y tế: 2 nhà cung cấp
('33333333-3333-3333-3333-333333333316', '11111111-1111-1111-1111-111111111110', '22222222-2222-2222-2222-222222222205', 88000.0000, 0, '2026-04-01 00:00:00.000000', 'Hàng Malaysia, đạt chuẩn FDA', '2026-04-01 08:00:00.000000', 0),
('33333333-3333-3333-3333-333333333317', '11111111-1111-1111-1111-111111111110', '22222222-2222-2222-2222-222222222206', 3.80, 1, '2026-04-01 00:00:00.000000', 'Nhập khẩu Thái Lan, MOQ 100 hộp', '2026-04-01 08:00:00.000000', 0),
-- Dầu ăn Neptune: thêm 1 báo giá mới
('33333333-3333-3333-3333-333333333318', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222206', 175000.0000, 0, '2026-04-05 00:00:00.000000', 'Giá mới tháng 4, giảm 5% so với tháng trước', '2026-04-05 08:00:00.000000', 0);

COMMIT;
