SET @dbname = DATABASE();
SET @tablename = 'posts';
SET @columnname = 'follower_ids';
SET @preparedStatement = (
  SELECT IF(
    (
      SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
      WHERE
        (TABLE_SCHEMA = @dbname)
        AND (TABLE_NAME = @tablename)
        AND (COLUMN_NAME = @columnname)
    ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' JSON NULL AFTER photo_ids')
  )
);
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;