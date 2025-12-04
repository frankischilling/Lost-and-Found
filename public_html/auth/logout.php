<?php
$host = $_SERVER['HTTP_HOST'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';
$devHeader = $_SERVER['HTTP_X_DEV_MODE'] ?? '';
$forwardedHost = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? '';
// Detect if request is from Vite proxy
$isDev = ($devHeader === 'true') || str_contains($forwardedHost, 'localhost') || str_contains($host, 'localhost') || str_contains($referer, 'localhost');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => $isDev ? 'localhost' : 'project.frankhagan.online',
    'secure' => !$isDev,
    'httponly' => true,
    'samesite' => $isDev ? 'Lax' : 'None',
]);
session_start();
session_unset();
session_destroy();

// Explicitly expire the PHPSESSID cookie
setcookie(session_name(), '', time() - 3600, '/', $isDev ? 'localhost' : 'project.frankhagan.online', !$isDev, true);

header('Content-Type: application/json');
echo json_encode(['status' => 'success']);
exit;
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

