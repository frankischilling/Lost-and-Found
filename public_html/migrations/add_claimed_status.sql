-- Add is_claimed field to posts table to track if a lost item has been successfully claimed/recovered
ALTER TABLE posts 
ADD COLUMN is_claimed TINYINT(1) NOT NULL DEFAULT 0 AFTER admin_approval_status,
ADD INDEX idx_is_claimed (is_claimed);
