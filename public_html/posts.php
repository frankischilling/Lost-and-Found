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
    return $_SESSION['user_id'] ?? null;
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
        // This handles the case where only 'role' column exists
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
                // Handle different return types from MySQL
                if ($isAdminBool === true || $isAdminBool === 1 || $isAdminBool === '1') {
                    return true;
                }
            }
        } catch (PDOException $e) {
            // is_admin column doesn't exist, that's fine - we're using role
        }
        
        return false;
    } catch (PDOException $e) {
        // If query fails, assume user is not admin
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
    $postType = isset($_GET['type']) ? $_GET['type'] : null; // Filter by 'lost' or 'found'
    
    switch ($method) {
        case 'GET':
            if ($id !== null && isValidUUID($id)) {
                // Get single post
                $stmt = $pdo->prepare('SELECT * FROM posts WHERE id = ?');
                $stmt->execute([$id]);
                $post = $stmt->fetch();
                
                if ($post) {
                    // Parse JSON fields if they exist
                    if (isset($post['tags']) && $post['tags']) {
                        $post['tags'] = json_decode($post['tags'], true);
                    }
                    if (isset($post['photo_ids']) && $post['photo_ids']) {
                        $post['photo_ids'] = json_decode($post['photo_ids'], true);
                    }
                    http_response_code(200);
                    echo json_encode($post);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Post not found'
                    ]);
                }
            } else {
                // Get all posts (optionally filtered by type)
                if ($postType && in_array($postType, ['lost', 'found'])) {
                    $stmt = $pdo->prepare('SELECT * FROM posts WHERE post_type = ? ORDER BY created_at DESC');
                    $stmt->execute([$postType]);
                } else {
                    $stmt = $pdo->query('SELECT * FROM posts ORDER BY created_at DESC');
                }
                $posts = $stmt->fetchAll();
                
                // Parse JSON fields for each post
                foreach ($posts as &$post) {
                    if (isset($post['tags']) && $post['tags']) {
                        $post['tags'] = json_decode($post['tags'], true);
                    }
                    if (isset($post['photo_ids']) && $post['photo_ids']) {
                        $post['photo_ids'] = json_decode($post['photo_ids'], true);
                    }
                }
                
                http_response_code(200);
                echo json_encode([
                    'status' => 'success',
                    'count' => count($posts),
                    'posts' => $posts
                ]);
            }
            break;
            
        case 'POST':
            // Require authentication for creating posts
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            // Create new post
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                $data = $_POST;
            }
            
            // Validate required fields
            if (!isset($data['item_name']) || empty(trim($data['item_name']))) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Item name is required'
                ]);
                exit;
            }
            
            if (!isset($data['post_type']) || !in_array($data['post_type'], ['lost', 'found'])) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Post type must be either "lost" or "found"'
                ]);
                exit;
            }
            
            $postType = $data['post_type'];
            $itemName = trim($data['item_name']);
            $description = isset($data['description']) ? trim($data['description']) : '';
            $content = isset($data['content']) ? trim($data['content']) : '';
            $locationFound = isset($data['location_found']) ? trim($data['location_found']) : null;
            $currentLocation = isset($data['current_location']) ? trim($data['current_location']) : null;
            $dateFound = isset($data['date_found']) ? trim($data['date_found']) : null;
            
            // Handle tags - convert array to JSON if provided
            $tags = null;
            if (isset($data['tags'])) {
                if (is_array($data['tags'])) {
                    $tags = json_encode($data['tags']);
                } else {
                    $tags = $data['tags']; // Assume it's already JSON string
                }
            }
            
            // Handle photo_ids - convert array to JSON if provided
            $photoIds = null;
            if (isset($data['photo_ids'])) {
                if (is_array($data['photo_ids'])) {
                    // Validate that all photo IDs are strings/valid
                    $validPhotoIds = array_filter($data['photo_ids'], function($id) {
                        return is_string($id) && !empty(trim($id));
                    });
                    if (!empty($validPhotoIds)) {
                        $photoIds = json_encode(array_values($validPhotoIds));
                    }
                } else if (is_string($data['photo_ids']) && !empty(trim($data['photo_ids']))) {
                    $photoIds = $data['photo_ids']; // Assume it's already JSON string
                }
            }
            
            // Validate date format if provided
            if ($dateFound && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFound)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Date found must be in YYYY-MM-DD format'
                ]);
                exit;
            }
            
            // Use item_name as title if title is not provided
            $title = isset($data['title']) && !empty(trim($data['title'])) ? trim($data['title']) : $itemName;
            
            // Determine admin approval status
            // Admins' posts are auto-approved, regular users' posts are pending
            $isAdmin = isUserAdmin($pdo, $userId);
            $approvalStatus = $isAdmin ? 'approved' : 'pending';
            
            // Generate UUID in PHP (more reliable for getting the value back)
            $uuid = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000, // Version 4
                mt_rand(0, 0x3fff) | 0x8000, // Variant bits
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            
            // Insert post with user_id, admin_approval_status, and photo_ids
            $stmt = $pdo->prepare('INSERT INTO posts (id, user_id, admin_approval_status, title, post_type, item_name, description, content, location_found, current_location, date_found, tags, photo_ids, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())');
            $stmt->execute([$uuid, $userId, $approvalStatus, $title, $postType, $itemName, $description, $content, $locationFound, $currentLocation, $dateFound, $tags, $photoIds]);
            
            $newId = $uuid;
            
            http_response_code(201);
            echo json_encode([
                'status' => 'success',
                'message' => 'Post created successfully',
                'id' => $newId,
                'admin_approval_status' => $approvalStatus
            ]);
            break;
            
        case 'PUT':
            // Require authentication for updating posts
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            // Update post
            if ($id === null || !isValidUUID($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid Post ID (UUID) is required'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                parse_str(file_get_contents('php://input'), $data);
            }
            
            // Check if post exists and get current post data
            $checkStmt = $pdo->prepare('SELECT id, user_id FROM posts WHERE id = ?');
            $checkStmt->execute([$id]);
            $existingPost = $checkStmt->fetch();
            
            if (!$existingPost) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Post not found'
                ]);
                exit;
            }
            
            // Check if user owns the post or is admin
            // Only the post creator or admins can update posts
            $isAdmin = isUserAdmin($pdo, $userId);
            $isOwner = ($existingPost['user_id'] !== null && $existingPost['user_id'] === $userId);
            
            if (!$isOwner && !$isAdmin) {
                // Get user's role for debugging
                $debugStmt = $pdo->prepare('SELECT id, email, role FROM users WHERE id = ? LIMIT 1');
                $debugStmt->execute([$userId]);
                $debugUser = $debugStmt->fetch(PDO::FETCH_ASSOC);
                
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'You do not have permission to update this post. Only the post creator or admins can update posts.',
                    'debug' => [
                        'user_id' => $userId,
                        'post_owner_id' => $existingPost['user_id'],
                        'is_owner' => $isOwner,
                        'is_admin_check_result' => $isAdmin,
                        'user_role' => $debugUser['role'] ?? 'not set'
                    ]
                ]);
                exit;
            }
            
            $updates = [];
            $params = [];
            
            if (isset($data['title'])) {
                $updates[] = 'title = ?';
                $params[] = trim($data['title']);
            }
            
            if (isset($data['post_type']) && in_array($data['post_type'], ['lost', 'found'])) {
                $updates[] = 'post_type = ?';
                $params[] = $data['post_type'];
            }
            
            if (isset($data['item_name'])) {
                $updates[] = 'item_name = ?';
                $params[] = trim($data['item_name']);
            }
            
            if (isset($data['content'])) {
                $updates[] = 'content = ?';
                $params[] = trim($data['content']);
            }
            
            if (isset($data['description'])) {
                $updates[] = 'description = ?';
                $params[] = trim($data['description']);
            }
            
            if (isset($data['location_found'])) {
                $updates[] = 'location_found = ?';
                $params[] = trim($data['location_found']);
            }
            
            if (isset($data['current_location'])) {
                $updates[] = 'current_location = ?';
                $params[] = trim($data['current_location']);
            }
            
            if (isset($data['date_found'])) {
                $dateFound = trim($data['date_found']);
                if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateFound)) {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Date found must be in YYYY-MM-DD format'
                    ]);
                    exit;
                }
                $updates[] = 'date_found = ?';
                $params[] = $dateFound;
            }
            
            if (isset($data['tags'])) {
                $tags = is_array($data['tags']) ? json_encode($data['tags']) : $data['tags'];
                $updates[] = 'tags = ?';
                $params[] = $tags;
            }
            
            if (isset($data['photo_ids'])) {
                if (is_array($data['photo_ids'])) {
                    $validPhotoIds = array_filter($data['photo_ids'], function($id) {
                        return is_string($id) && !empty(trim($id));
                    });
                    $photoIds = !empty($validPhotoIds) ? json_encode(array_values($validPhotoIds)) : null;
                } else if (is_string($data['photo_ids']) && !empty(trim($data['photo_ids']))) {
                    $photoIds = $data['photo_ids'];
                } else {
                    $photoIds = null;
                }
                $updates[] = 'photo_ids = ?';
                $params[] = $photoIds;
            }
            
            // Allow admins to update approval status
            if (isset($data['admin_approval_status']) && $isAdmin) {
                if (in_array($data['admin_approval_status'], ['pending', 'approved', 'rejected'])) {
                    $updates[] = 'admin_approval_status = ?';
                    $params[] = $data['admin_approval_status'];
                }
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'No fields to update'
                ]);
                exit;
            }
            
            $updates[] = 'updated_at = NOW()';
            $params[] = $id;
            
            $sql = 'UPDATE posts SET ' . implode(', ', $updates) . ' WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Post updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Require authentication for deleting posts
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            // Delete post
            if ($id === null || !isValidUUID($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid Post ID (UUID) is required'
                ]);
                exit;
            }
            
            // Check if post exists and get user_id
            $checkStmt = $pdo->prepare('SELECT id, user_id FROM posts WHERE id = ?');
            $checkStmt->execute([$id]);
            $existingPost = $checkStmt->fetch();
            
            if (!$existingPost) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Post not found'
                ]);
                exit;
            }
            
            // Check if user owns the post or is admin
            // Only the post creator or admins can delete posts
            $isAdmin = isUserAdmin($pdo, $userId);
            $isOwner = ($existingPost['user_id'] !== null && $existingPost['user_id'] === $userId);
            
            if (!$isOwner && !$isAdmin) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'You do not have permission to delete this post. Only the post creator or admins can delete posts.'
                ]);
                exit;
            }
            
            $stmt = $pdo->prepare('DELETE FROM posts WHERE id = ?');
            $stmt->execute([$id]);
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'Post deleted successfully'
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

