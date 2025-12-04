<?php
/**
 * Session Check Endpoint
 * Returns current user session information
 */

require_once __DIR__ . '/../config.php';
startSession();

header('Content-Type: application/json');
setCORSHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Check for user session (callback.php stores as $_SESSION['user'])
if (isset($_SESSION['user'])) {
    // Attach UUID only if legacy session field is a valid UUID
    $user = $_SESSION['user'];
    if (isset($_SESSION['user_id']) && is_string($_SESSION['user_id'])) {
        $maybeUuid = $_SESSION['user_id'];
        if (preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $maybeUuid)) {
            $user['uuid'] = $maybeUuid;
        }
    }
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'logged_in' => true,
        'user' => $user,
    ]);
} else {
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'logged_in' => false,
        'user' => null
    ]);
}

