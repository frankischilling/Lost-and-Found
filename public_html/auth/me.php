<?php
require_once __DIR__ . '/../config.php';
header('Content-Type: application/json');
setCORSHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

startSession();

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
    exit;
}

$userId = isset($_SESSION['user']['id']) ? $_SESSION['user']['id'] : ($_SESSION['user_id'] ?? null);
if (!$userId) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing session user id']);
    exit;
}

try {
    $pdo = getDBConnection();
    if ($pdo === null) {
        throw new Exception('Failed to connect to database');
    }

    $stmt = $pdo->prepare('SELECT id, google_id, email, name, picture, phone, created_at, updated_at, last_login, role FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }

    http_response_code(200);
    echo json_encode(['status' => 'success', 'user' => $user]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error', 'detail' => $e->getMessage()]);
}
