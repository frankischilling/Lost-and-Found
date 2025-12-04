<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
ini_set('log_errors', '1');

header('Content-Type: application/json');

try {
    if (!file_exists(__DIR__ . '/../config.php')) {
        throw new Exception('config.php not found at: ' . __DIR__ . '/../config.php');
    }
    
    require_once __DIR__ . '/../config.php';

    // Start session and check authentication
    if (!function_exists('startSession')) {
        throw new Exception('startSession function not found');
    }
    
    startSession();

    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required', 'session' => array_keys($_SESSION)]);
        exit;
    }

    $user_id = $_SESSION['user_id'] ?? null;
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'No user_id in session', 'session_keys' => array_keys($_SESSION)]);
        exit;
    }

    // Get database connection
    if (!function_exists('getDBConnection')) {
        throw new Exception('getDBConnection function not found');
    }
    
    $pdo = getDBConnection();
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Check if user is admin
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(403);
        echo json_encode(['error' => 'User not found', 'user_id' => $user_id]);
        exit;
    }
    
    if ($user['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required', 'role' => $user['role'] ?? 'none']);
        exit;
    }

    // Fetch statistics
    $stats = [];
    
    // Total posts
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM posts");
    $stats['total_posts'] = (int)$stmt->fetchColumn();

    // Pending posts
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM posts WHERE admin_approval_status = 'pending'");
    $stats['pending_posts'] = (int)$stmt->fetchColumn();

    // Approved posts
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM posts WHERE admin_approval_status = 'approved'");
    $stats['approved_posts'] = (int)$stmt->fetchColumn();

    // Total users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
    $stats['total_users'] = (int)$stmt->fetchColumn();

    // Lost items
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM posts WHERE post_type = 'lost'");
    $stats['lost_items'] = (int)$stmt->fetchColumn();

    // Found items
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM posts WHERE post_type = 'found'");
    $stats['found_items'] = (int)$stmt->fetchColumn();

    http_response_code(200);
    echo json_encode($stats);

} catch (Exception $e) {
    error_log("Stats endpoint error: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
