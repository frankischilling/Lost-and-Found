ALTER TABLE posts 
ADD COLUMN user_id CHAR(36) NULL AFTER id,
ADD INDEX idx_user_id (user_id);

ALTER TABLE posts 
ADD COLUMN admin_approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' AFTER user_id,
ADD INDEX idx_approval_status (admin_approval_status);

ALTER TABLE posts 
ADD COLUMN photo_ids JSON NULL AFTER tags;