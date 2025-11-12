<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

// UUID validation function
function isValidUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid);
}

/**
 * Check if user is authenticated
 * Returns user_id if authenticated, false otherwise
 */
function requireAuth() {
    startSession();
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Authentication required',
            'login_url' => '/auth/login.php'
        ]);
        exit;
    }
    $userId = $_SESSION['user_id'] ?? null;
    if (!$userId) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'User ID not found in session',
            'login_url' => '/auth/login.php'
        ]);
        exit;
    }
    return trim((string)$userId);
}

/**
 * Check if user is admin
 * @param PDO $pdo Database connection
 * @param string $userId User ID to check
 * @return bool True if user is admin, false otherwise
 */
function isUserAdmin($pdo, $userId) {
    try {
        // First, try to get role field (primary method)
        $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && isset($user['role']) && $user['role'] !== null) {
            $role = trim(strtolower($user['role']));
            if ($role === 'admin') {
                return true;
            }
        }
        
        // If role check didn't work, try is_admin field (fallback for older schemas)
        try {
            $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && isset($user['is_admin'])) {
                $isAdminBool = $user['is_admin'];
                if ($isAdminBool === true || $isAdminBool === 1 || $isAdminBool === '1') {
                    return true;
                }
            }
        } catch (PDOException $e) {
            // is_admin column doesn't exist, that's fine - we're using role
        }
        
        return false;
    } catch (PDOException $e) {
        error_log("isUserAdmin error for user $userId: " . $e->getMessage());
        return false;
    }
}

try {
    $pdo = getDBConnection();
    
    if ($pdo === null) {
        throw new Exception('Failed to connect to database');
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    $postId = isset($_GET['post_id']) ? trim($_GET['post_id']) : null;
    
    switch ($method) {
        case 'GET':
            if ($id !== null && isValidUUID($id)) {
                // Get single comment by ID
                $stmt = $pdo->prepare('SELECT c.*, u.name as user_name, u.email as user_email, u.picture as user_picture FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?');
                $stmt->execute([$id]);
                $comment = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($comment) {
                    http_response_code(200);
                    echo json_encode($comment);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Comment not found'
                    ]);
                }
            } else if ($postId !== null && isValidUUID($postId)) {
                // Get all comments for a specific post
                // First verify the post exists
                $postCheck = $pdo->prepare('SELECT id FROM posts WHERE id = ?');
                $postCheck->execute([$postId]);
                
                if (!$postCheck->fetch()) {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Post not found'
                    ]);
                    exit;
                }
                
                $stmt = $pdo->prepare('SELECT c.*, u.name as user_name, u.email as user_email, u.picture as user_picture FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC');
                $stmt->execute([$postId]);
                $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                http_response_code(200);
                echo json_encode([
                    'status' => 'success',
                    'count' => count($comments),
                    'comments' => $comments
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Either comment ID or post_id parameter is required'
                ]);
            }
            break;
            
        case 'POST':
            // Create new comment - requires authentication
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                $data = $_POST;
            }
            
            // Validate required fields
            if (!isset($data['post_id']) || empty(trim($data['post_id']))) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Post ID is required'
                ]);
                exit;
            }
            
            if (!isset($data['content']) || empty(trim($data['content']))) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Comment content is required'
                ]);
                exit;
            }
            
            $postId = trim($data['post_id']);
            $content = trim($data['content']);
            
            // Validate UUID format
            if (!isValidUUID($postId)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid post ID format (must be UUID)'
                ]);
                exit;
            }
            
            // Verify post exists
            $postCheck = $pdo->prepare('SELECT id FROM posts WHERE id = ?');
            $postCheck->execute([$postId]);
            
            if (!$postCheck->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Post not found'
                ]);
                exit;
            }
            
            // Generate UUID for comment
            $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000, // Version 4
                mt_rand(0, 0x3fff) | 0x8000, // Variant bits
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            
            // Insert comment
            $stmt = $pdo->prepare('INSERT INTO comments (id, post_id, user_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())');
            $stmt->execute([$uuid, $postId, $userId, $content]);
            
            // Fetch the created comment with user info
            $stmt = $pdo->prepare('SELECT c.*, u.name as user_name, u.email as user_email, u.picture as user_picture FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?');
            $stmt->execute([$uuid]);
            $newComment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Comment created successfully',
                'comment' => $newComment
            ]);
            break;
            
        case 'PUT':
            // Update comment - requires authentication
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            if ($id === null || !isValidUUID($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid Comment ID (UUID) is required'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                parse_str(file_get_contents('php://input'), $data);
            }
            
            // Check if comment exists and get user_id
            $checkStmt = $pdo->prepare('SELECT id, user_id FROM comments WHERE id = ?');
            $checkStmt->execute([$id]);
            $existingComment = $checkStmt->fetch();
            
            if (!$existingComment) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Comment not found'
                ]);
                exit;
            }
            
            // Check permissions: users can edit their own comments, admins can edit any
            $isAdmin = isUserAdmin($pdo, $userId);
            
            // Normalize user IDs for comparison (trim whitespace, ensure strings, lowercase for UUID comparison)
            $commentOwnerId = strtolower(trim((string)$existingComment['user_id']));
            $currentUserId = strtolower(trim((string)$userId));
            $isOwner = ($commentOwnerId === $currentUserId);
            
            // Debug logging (remove in production if needed)
            error_log("Comment update permission check - Comment Owner: '$commentOwnerId', Current User: '$currentUserId', Is Owner: " . ($isOwner ? 'true' : 'false') . ", Is Admin: " . ($isAdmin ? 'true' : 'false'));
            
            if (!$isOwner && !$isAdmin) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'You do not have permission to edit this comment. Only the comment creator or admins can edit comments.'
                ]);
                exit;
            }
            
            // Validate content if provided
            if (!isset($data['content']) || empty(trim($data['content']))) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Comment content is required'
                ]);
                exit;
            }
            
            $content = trim($data['content']);
            
            // Update comment
            $stmt = $pdo->prepare('UPDATE comments SET content = ?, updated_at = NOW() WHERE id = ?');
            $stmt->execute([$content, $id]);
            
            // Fetch the updated comment with user info
            $stmt = $pdo->prepare('SELECT c.*, u.name as user_name, u.email as user_email, u.picture as user_picture FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?');
            $stmt->execute([$id]);
            $updatedComment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Comment updated successfully',
                'comment' => $updatedComment
            ]);
            break;
            
        case 'DELETE':
            // Delete comment - requires authentication
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            if ($id === null || !isValidUUID($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid Comment ID (UUID) is required'
                ]);
                exit;
            }
            
            // Check if comment exists and get user_id
            $checkStmt = $pdo->prepare('SELECT id, user_id FROM comments WHERE id = ?');
            $checkStmt->execute([$id]);
            $existingComment = $checkStmt->fetch();
            
            if (!$existingComment) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Comment not found'
                ]);
                exit;
            }
            
            // Check permissions: users can delete their own comments, admins can delete any
            $isAdmin = isUserAdmin($pdo, $userId);
            
            // Normalize user IDs for comparison (trim whitespace, ensure strings)
            $commentOwnerId = trim((string)$existingComment['user_id']);
            $currentUserId = trim((string)$userId);
            $isOwner = ($commentOwnerId === $currentUserId);
            
            if (!$isOwner && !$isAdmin) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'You do not have permission to delete this comment. Only the comment creator or admins can delete comments.'
                ]);
                exit;
            }
            
            $stmt = $pdo->prepare('DELETE FROM comments WHERE id = ?');
            $stmt->execute([$id]);
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Comment deleted successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'status' => 'error',
                'message' => 'Method not allowed'
            ]);
            break;
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

