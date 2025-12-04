<?php
require_once 'config.php';
header('Content-Type: application/json');
setCORSHeaders();

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Health check response
http_response_code(200);
echo json_encode([
    'status' => 'healthy',
    'message' => 'server is healthy',
    'timestamp' => date('c')
]);

