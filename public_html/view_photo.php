<?php
require_once 'config.php';

// UUID validation function
function isValidUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid);
}

/**
 * Get current user ID if authenticated
 * Returns user_id if authenticated, null otherwise
 */
function getCurrentUserId() {
    startSession();
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        return $_SESSION['user_id'] ?? null;
    }
    return null;
}

// Optional authentication - get user ID if logged in
$userId = getCurrentUserId();

// Get photo UUID from query parameter
$photoUuid = isset($_GET['id']) ? trim($_GET['id']) : null;

if (!$photoUuid || !isValidUUID($photoUuid)) {
    http_response_code(400);
    header('Content-Type: text/plain');
    echo 'Invalid or missing photo ID';
    exit;
}

// Photo directory
$uploadDir = __DIR__ . '/uploads/photos/';

// Find the photo file (could have different extensions)
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
$photoPath = null;
$photoExtension = null;

foreach ($allowedExtensions as $ext) {
    $potentialPath = $uploadDir . $photoUuid . '.' . $ext;
    if (file_exists($potentialPath)) {
        $photoPath = $potentialPath;
        $photoExtension = $ext;
        break;
    }
}

if (!$photoPath || !file_exists($photoPath)) {
    http_response_code(404);
    header('Content-Type: text/plain');
    echo 'Photo not found';
    exit;
}

// Optional: Verify user has permission to view this photo
// Check if photo is associated with a post that the user can access
try {
    $pdo = getDBConnection();
    if ($pdo) {
        // Check if this photo UUID is in any post's photo_ids
        $stmt = $pdo->prepare('SELECT id, user_id, admin_approval_status, privacy, is_claimed FROM posts WHERE JSON_CONTAINS(photo_ids, ?)');
        $photoUuidJson = json_encode($photoUuid);
        $stmt->execute([$photoUuidJson]);
        $post = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($post) {
            // Photo is associated with a post
            // Determine what the user is allowed to view based on:
            // 1. Is the post approved?
            // 2. Is the post claimed?
            // 3. What is the post's privacy level?
            // 4. Is the user authenticated?
            // 5. Is the user the post owner?
            // 6. Is the user an admin?
            
            $isApproved = ($post['admin_approval_status'] === 'approved');
            $isClaimed = ($post['is_claimed'] === 1 || $post['is_claimed'] === '1');
            $privacy = $post['privacy'] ?? 'school_members'; // Default to school_members if not set
            $isOwner = $userId && ($post['user_id'] !== null && strtolower(trim($post['user_id'])) === strtolower(trim($userId)));
            
            // Check if user is admin
            $isAdmin = false;
            if ($userId) {
                try {
                    $adminStmt = $pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
                    $adminStmt->execute([$userId]);
                    $user = $adminStmt->fetch(PDO::FETCH_ASSOC);
                    if ($user && isset($user['role']) && strtolower(trim($user['role'])) === 'admin') {
                        $isAdmin = true;
                    }
                } catch (PDOException $e) {
                    // If role check fails, continue without admin check
                }
            }
            
            $canView = false;
            
            if ($isAdmin) {
                // Admins can always view
                $canView = true;
            } else if ($isOwner) {
                // Owners can always view their own posts
                $canView = true;
            } else if (!$isApproved) {
                // Rejected or pending posts are only viewable by owner/admin
                $canView = false;
            } else if ($isClaimed) {
                // Claimed posts are only viewable by owner/admin
                $canView = false;
            } else {
                // Unapproved posts cannot be viewed
                // Approved and unclaimed posts can be viewed based on privacy
                if ($privacy === 'anyone') {
                    // Public posts are viewable by anyone (authenticated or not)
                    $canView = true;
                } else if ($privacy === 'school_members' && $userId) {
                    // School members only posts are viewable by authenticated users
                    $canView = true;
                } else if ($privacy === 'private') {
                    // Private posts are only viewable by owner (already checked above)
                    $canView = false;
                }
            }
            
            if (!$canView) {
                http_response_code(403);
                header('Content-Type: text/plain');
                echo 'You do not have permission to view this photo';
                exit;
            }
        } else {
            // Photo is not associated with any post
            // Only authenticated users can view orphaned photos
            if (!$userId) {
                http_response_code(403);
                header('Content-Type: text/plain');
                echo 'You do not have permission to view this photo';
                exit;
            }
        }
    }
} catch (PDOException $e) {
    // If database check fails, allow viewing only for authenticated users (fail open for authenticated users)
    error_log("Photo permission check error: " . $e->getMessage());
    if (!$userId) {
        http_response_code(403);
        header('Content-Type: text/plain');
        echo 'You do not have permission to view this photo';
        exit;
    }
}

// Determine MIME type based on extension
$mimeTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp'
];

$mimeType = $mimeTypes[$photoExtension] ?? 'image/jpeg';

// Get file size
$fileSize = filesize($photoPath);

// Set headers for image serving
header('Content-Type: ' . $mimeType);
header('Content-Length: ' . $fileSize);
header('Cache-Control: private, max-age=3600'); // Cache for 1 hour
header('X-Content-Type-Options: nosniff');

// Disable output buffering for large files
if (ob_get_level()) {
    ob_end_clean();
}

// Stream the file
readfile($photoPath);
exit;

