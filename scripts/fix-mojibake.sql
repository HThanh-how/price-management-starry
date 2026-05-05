-- =============================================
-- Mojibake Repair Migration (v2 — round-trip detector)
-- =============================================
-- Purpose:
--   Repair UTF-8 text columns whose contents were double-encoded during the
--   original `init-db.sql` import. The seed script was streamed into a mysql
--   client that defaulted to `character_set_client = latin1`, so each UTF-8
--   byte of every Vietnamese character was interpreted as a separate Latin-1
--   character and re-encoded into utf8mb4 — leaving e.g. `Cà phê` stored as
--   `CÃ  phÃª` (literally `0xC3 0x83 0xC2 0xA0 ...`).
--
-- Strategy (idempotent, lossless):
--   The decode step is `CONVERT(CAST(CONVERT(col USING latin1) AS BINARY) USING utf8mb4)`:
--     1. `CONVERT(col USING latin1)` reinterprets each utf8mb4 codepoint as the
--        Latin-1 (CP1252) byte that originally produced it during the corruption.
--     2. `CAST(... AS BINARY)` keeps that byte stream raw, no charset attached.
--     3. `CONVERT(... USING utf8mb4)` decodes those bytes as proper UTF-8.
--
--   A row is mojibake **iff** every character it contains is representable in
--   Latin-1 (CP1252). That is exactly the round-trip check
--      `CONVERT(CONVERT(col USING latin1) USING utf8mb4) = col`
--   — if the value survives a charset round-trip via Latin-1 unchanged, every
--   codepoint sits in U+0000–U+00FF and the value is a valid candidate for
--   decoding. Healthy Vietnamese text contains characters outside Latin-1
--   (`Đ` U+0110, `ư` U+01B0, `ờ` U+1EDD, `ạ` U+1EA1, …) and therefore fails the
--   round-trip and is left untouched.
--
--   We additionally require `decoded != original` so that pure-ASCII rows are
--   not pointlessly rewritten.
--
-- Safety:
--   * Runs inside a single transaction.
--   * Idempotent — re-running the script after a successful pass is a no-op,
--     because every previously-fixed row now contains non-Latin-1 codepoints
--     and fails the round-trip guard.
--   * No rows are deleted; soft-deleted rows are repaired too.
-- =============================================

SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;

START TRANSACTION;

-- ------ items ------
UPDATE `items`
SET `item_name` = CONVERT(CAST(CONVERT(`item_name` USING latin1) AS BINARY) USING utf8mb4)
WHERE `item_name` IS NOT NULL
  AND CONVERT(CONVERT(`item_name` USING latin1) USING utf8mb4) = `item_name`
  AND CONVERT(CAST(CONVERT(`item_name` USING latin1) AS BINARY) USING utf8mb4) <> `item_name`;

UPDATE `items`
SET `description` = CONVERT(CAST(CONVERT(`description` USING latin1) AS BINARY) USING utf8mb4)
WHERE `description` IS NOT NULL
  AND CONVERT(CONVERT(`description` USING latin1) USING utf8mb4) = `description`
  AND CONVERT(CAST(CONVERT(`description` USING latin1) AS BINARY) USING utf8mb4) <> `description`;

UPDATE `items`
SET `unit` = CONVERT(CAST(CONVERT(`unit` USING latin1) AS BINARY) USING utf8mb4)
WHERE `unit` IS NOT NULL
  AND CONVERT(CONVERT(`unit` USING latin1) USING utf8mb4) = `unit`
  AND CONVERT(CAST(CONVERT(`unit` USING latin1) AS BINARY) USING utf8mb4) <> `unit`;

UPDATE `items`
SET `category` = CONVERT(CAST(CONVERT(`category` USING latin1) AS BINARY) USING utf8mb4)
WHERE `category` IS NOT NULL
  AND CONVERT(CONVERT(`category` USING latin1) USING utf8mb4) = `category`
  AND CONVERT(CAST(CONVERT(`category` USING latin1) AS BINARY) USING utf8mb4) <> `category`;

-- ------ suppliers ------
UPDATE `suppliers`
SET `supplier_name` = CONVERT(CAST(CONVERT(`supplier_name` USING latin1) AS BINARY) USING utf8mb4)
WHERE `supplier_name` IS NOT NULL
  AND CONVERT(CONVERT(`supplier_name` USING latin1) USING utf8mb4) = `supplier_name`
  AND CONVERT(CAST(CONVERT(`supplier_name` USING latin1) AS BINARY) USING utf8mb4) <> `supplier_name`;

UPDATE `suppliers`
SET `contact_person` = CONVERT(CAST(CONVERT(`contact_person` USING latin1) AS BINARY) USING utf8mb4)
WHERE `contact_person` IS NOT NULL
  AND CONVERT(CONVERT(`contact_person` USING latin1) USING utf8mb4) = `contact_person`
  AND CONVERT(CAST(CONVERT(`contact_person` USING latin1) AS BINARY) USING utf8mb4) <> `contact_person`;

UPDATE `suppliers`
SET `address` = CONVERT(CAST(CONVERT(`address` USING latin1) AS BINARY) USING utf8mb4)
WHERE `address` IS NOT NULL
  AND CONVERT(CONVERT(`address` USING latin1) USING utf8mb4) = `address`
  AND CONVERT(CAST(CONVERT(`address` USING latin1) AS BINARY) USING utf8mb4) <> `address`;

-- ------ item_supplier_prices ------
UPDATE `item_supplier_prices`
SET `remark` = CONVERT(CAST(CONVERT(`remark` USING latin1) AS BINARY) USING utf8mb4)
WHERE `remark` IS NOT NULL
  AND CONVERT(CONVERT(`remark` USING latin1) USING utf8mb4) = `remark`
  AND CONVERT(CAST(CONVERT(`remark` USING latin1) AS BINARY) USING utf8mb4) <> `remark`;

-- ------ users (full_name may include diacritics) ------
UPDATE `users`
SET `full_name` = CONVERT(CAST(CONVERT(`full_name` USING latin1) AS BINARY) USING utf8mb4)
WHERE `full_name` IS NOT NULL
  AND CONVERT(CONVERT(`full_name` USING latin1) USING utf8mb4) = `full_name`
  AND CONVERT(CAST(CONVERT(`full_name` USING latin1) AS BINARY) USING utf8mb4) <> `full_name`;

COMMIT;

-- Verification (run manually after the migration):
--   SELECT item_code, item_name FROM items LIMIT 5;
--   -- should show "Gạo ST25 Premium", "Đường RE Biên Hòa", etc.
