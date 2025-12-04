-- Migration: Fix user_id references to use database UUID instead of Google ID
-- This updates existing comments and posts to use the proper database UUID

-- Update comments table: convert Google ID to database UUID
UPDATE comments c
INNER JOIN users u ON c.user_id = u.google_id
SET c.user_id = u.id
WHERE c.user_id = u.google_id;

-- Update post_history table: convert Google ID to database UUID
UPDATE post_history ph
INNER JOIN users u ON ph.user_id = u.google_id
SET ph.user_id = u.id
WHERE ph.user_id = u.google_id;

-- Update posts table: convert Google ID to database UUID (if user_id column exists)
UPDATE posts p
INNER JOIN users u ON p.user_id = u.google_id
SET p.user_id = u.id
WHERE p.user_id = u.google_id;

-- Verify the migration
SELECT 
    'Comments with proper UUID' as status,
    COUNT(*) as count
FROM comments c
INNER JOIN users u ON c.user_id = u.id

UNION ALL

SELECT 
    'History with proper UUID' as status,
    COUNT(*) as count
FROM post_history ph
INNER JOIN users u ON ph.user_id = u.id

UNION ALL

SELECT 
    'Posts with proper UUID' as status,
    COUNT(*) as count
FROM posts p
INNER JOIN users u ON p.user_id = u.id;
