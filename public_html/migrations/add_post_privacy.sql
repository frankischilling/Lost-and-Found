-- Add privacy column to posts table
ALTER TABLE posts 
ADD COLUMN privacy ENUM('anyone', 'school_members', 'private') NOT NULL DEFAULT 'anyone' AFTER admin_approval_status,
ADD INDEX idx_privacy (privacy);
