-- Add paymentMethod column to orders table

-- Check if paymentMethod column exists, if not add it
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'orders'
  AND COLUMN_NAME = 'paymentMethod';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `orders` ADD COLUMN `paymentMethod` VARCHAR(50) NOT NULL DEFAULT "COD" AFTER `shippingAddress`',
  'SELECT "Column paymentMethod already exists" AS Info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the changes
SELECT
    COLUMN_NAME,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_KEY,
    COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'orders'
ORDER BY ORDINAL_POSITION;
