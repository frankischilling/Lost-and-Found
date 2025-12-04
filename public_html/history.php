<?php
require_once 'config.php';
header('Content-Type: application/json');
setCORSHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// UUID validation function
function isValidUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid);
}

/**
 * Generate UUID v4
 */
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, // Version 4
        mt_rand(0, 0x3fff) | 0x8000, // Variant bits
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Log a history event for a post
 * @param PDO $pdo Database connection
 * @param string $postId Post ID
 * @param string $userId User ID (can be null for system events)
 * @param string $type Event type (e.g., 'created', 'updated', 'status_changed', 'comment_added', 'approved', 'rejected')
 * @param string $message Human-readable message describing the event
 * @param array $metadata Optional additional data (will be JSON encoded)
 * @return string|false History entry ID on success, false on failure
 */
function logPostHistory($pdo, $postId, $userId, $type, $message, $metadata = null) {
    try {
        $historyId = generateUUID();
        $metadataJson = $metadata ? json_encode($metadata) : null;
        
        $stmt = $pdo->prepare('INSERT INTO post_history (id, post_id, user_id, type, message, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())');
        $stmt->execute([$historyId, $postId, $userId, $type, $message, $metadataJson]);
        
        return $historyId;
    } catch (PDOException $e) {
        error_log("Failed to log post history: " . $e->getMessage());
        return false;
    }
}

try {
    $pdo = getDBConnection();
    
    if ($pdo === null) {
        throw new Exception('Failed to connect to database');
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            $postId = isset($_GET['post_id']) ? trim($_GET['post_id']) : null;
            
            if ($postId === null || !isValidUUID($postId)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid post_id parameter is required'
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
            
            // Pagination parameters
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $pageSize = isset($_GET['pageSize']) ? min(100, max(1, intval($_GET['pageSize']))) : 10;
            $offset = ($page - 1) * $pageSize;
            
            // Get total count
            $countStmt = $pdo->prepare('SELECT COUNT(*) as total FROM post_history WHERE post_id = ?');
            $countStmt->execute([$postId]);
            $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get paginated history with user info
            $stmt = $pdo->prepare('
                SELECT 
                    h.*,
                    u.name as user_name,
                    u.email as user_email,
                    u.picture as user_picture
                FROM post_history h
                LEFT JOIN users u ON h.user_id = u.id
                WHERE h.post_id = ?
                ORDER BY h.created_at DESC
                LIMIT ? OFFSET ?
            ');
            $stmt->execute([$postId, $pageSize, $offset]);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $hasMore = ($offset + count($history)) < $totalCount;
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'items' => $history,
                'page' => $page,
                'pageSize' => $pageSize,
                'totalCount' => $totalCount,
                'hasMore' => $hasMore
            ]);
            break;
            
        case 'POST':
            // Create history entry (typically for system/admin use)
            startSession();
            if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
                http_response_code(401);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Authentication required'
                ]);
                exit;
            }
            
            $userId = $_SESSION['user_id'] ?? null;
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                $data = $_POST;
            }
            
            // Validate required fields
            if (!isset($data['post_id']) || empty(trim($data['post_id']))) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'post_id is required'
                ]);
                exit;
            }
            
            if (!isset($data['type']) || empty(trim($data['type']))) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'type is required'
                ]);
                exit;
            }
            
            if (!isset($data['message']) || empty(trim($data['message']))) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'message is required'
                ]);
                exit;
            }
            
            $postId = trim($data['post_id']);
            $type = trim($data['type']);
            $message = trim($data['message']);
            $metadata = isset($data['metadata']) ? $data['metadata'] : null;
            
            if (!isValidUUID($postId)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Invalid post_id format'
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
            
            $historyId = logPostHistory($pdo, $postId, $userId, $type, $message, $metadata);
            
            if ($historyId) {
                // Fetch the created history entry
                $stmt = $pdo->prepare('
                    SELECT 
                        h.*,
                        u.name as user_name,
                        u.email as user_email,
                        u.picture as user_picture
                    FROM post_history h
                    LEFT JOIN users u ON h.user_id = u.id
                    WHERE h.id = ?
                ');
                $stmt->execute([$historyId]);
                $historyEntry = $stmt->fetch(PDO::FETCH_ASSOC);
                
                http_response_code(201);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'History entry created',
                    'history' => $historyEntry
                ]);
            } else {
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Failed to create history entry'
                ]);
            }
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
