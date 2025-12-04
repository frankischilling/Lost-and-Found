-- Creates a table to cache user avatars
CREATE TABLE IF NOT EXISTS user_avatars (
  user_id VARCHAR(64) PRIMARY KEY,
  source_url TEXT,
  local_path TEXT,
  content_type VARCHAR(64),
  last_fetched_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
