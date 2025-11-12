<?php
/**
 * Logout Endpoint
 * Destroys the user session
 */

require_once __DIR__ . '/../config.php';

startSession();

// Destroy session
$_SESSION = [];
session_destroy();

// Return success response
header('Content-Type: application/json');
http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Logged out successfully'
]);

