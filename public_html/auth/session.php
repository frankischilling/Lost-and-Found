<?php
/**
 * Session Check Endpoint
 * Returns current user session information
 */

require_once __DIR__ . '/../config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

startSession();

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'logged_in' => true,
        'user' => [
            'id' => $_SESSION['user_id'] ?? null,
            'email' => $_SESSION['user_email'] ?? null,
            'name' => $_SESSION['user_name'] ?? null,
            'picture' => $_SESSION['user_picture'] ?? null
        ]
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'logged_in' => false,
        'user' => null
    ]);
}

