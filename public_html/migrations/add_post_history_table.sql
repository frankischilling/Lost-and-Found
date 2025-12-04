-- Migration: Add post_history table
-- This table stores a timeline of events for each post (creation, updates, status changes, etc.)

CREATE TABLE IF NOT EXISTS post_history (
    id VARCHAR(36) PRIMARY KEY,
    post_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(255) NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    metadata JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_post_history_post_id (post_id),
    INDEX idx_post_history_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for common queries
CREATE INDEX idx_post_history_type ON post_history(type);
CREATE INDEX idx_post_history_post_created ON post_history(post_id, created_at DESC);
