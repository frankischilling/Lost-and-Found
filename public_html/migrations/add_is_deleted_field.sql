-- Add is_deleted field to posts table for soft-delete functionality
-- When a post is deleted by owner or admin, it's marked as deleted but not permanently removed
-- Regular users cannot see deleted posts, but admins can view them in the admin dashboard
ALTER TABLE posts 
ADD COLUMN is_deleted TINYINT(1) NOT NULL DEFAULT 0 AFTER is_claimed,
ADD INDEX idx_is_deleted (is_deleted);
