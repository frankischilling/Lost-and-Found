<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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

try {
    $pdo = getDBConnection();
    
    if ($pdo === null) {
        throw new Exception('Failed to connect to database');
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    switch ($method) {
        case 'GET':
            // Require authentication
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            if ($id !== null && isValidUUID($id)) {
                // Get single notification
                $stmt = $pdo->prepare('SELECT * FROM notifications WHERE id = ? AND user_id = ?');
                $stmt->execute([$id, $userId]);
                $notification = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($notification) {
                    // Convert is_read to boolean
                    $notification['is_read'] = (bool)$notification['is_read'];
                    http_response_code(200);
                    echo json_encode($notification);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Notification not found'
                    ]);
                }
            } else {
                // Get all notifications for current user
                if ($unreadOnly) {
                    $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC');
                    $stmt->execute([$userId]);
                } else {
                    $stmt = $pdo->prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC');
                    $stmt->execute([$userId]);
                }
                $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Convert is_read to boolean for each notification
                foreach ($notifications as &$notification) {
                    $notification['is_read'] = (bool)$notification['is_read'];
                }
                
                $unreadCount = 0;
                if (!$unreadOnly) {
                    $countStmt = $pdo->prepare('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0');
                    $countStmt->execute([$userId]);
                    $countResult = $countStmt->fetch();
                    $unreadCount = (int)$countResult['count'];
                } else {
                    $unreadCount = count($notifications);
                }
                
                http_response_code(200);
                echo json_encode([
                    'status' => 'success',
                    'count' => count($notifications),
                    'unread_count' => $unreadCount,
                    'notifications' => $notifications
                ]);
            }
            break;
            
        case 'PUT':
            // Require authentication
            $userId = requireAuth();
            if (!$userId) {
                exit; // requireAuth already sent response
            }
            
            if ($id === null || !isValidUUID($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid Notification ID (UUID) is required'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            if (!$data) {
                $data = $_POST;
            }
            
            // Check if notification exists and belongs to user
            $checkStmt = $pdo->prepare('SELECT id, user_id FROM notifications WHERE id = ?');
            $checkStmt->execute([$id]);
            $existingNotification = $checkStmt->fetch();
            
            if (!$existingNotification) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Notification not found'
                ]);
                exit;
            }
            
            // Verify notification belongs to current user
            if (strtolower(trim($existingNotification['user_id'])) !== strtolower(trim($userId))) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'You do not have permission to update this notification'
                ]);
                exit;
            }
            
            // Update is_read status
            if (isset($data['is_read'])) {
                $isRead = $data['is_read'] ? 1 : 0;
                $stmt = $pdo->prepare('UPDATE notifications SET is_read = ? WHERE id = ?');
                $stmt->execute([$isRead, $id]);
                
                http_response_code(200);
                echo json_encode([
                    'status' => 'success',
                    'message' => 'Notification updated successfully'
                ]);
            } else {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'is_read field is required'
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

