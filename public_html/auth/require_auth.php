<?php
/**
 * Authentication Middleware
 * Include this file at the top of protected pages to require authentication
 */

require_once __DIR__ . '/../config.php';

startSession();

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    // Store current URL for redirect after login
    $current_url = $_SERVER['REQUEST_URI'];
    
    // For API endpoints, return JSON error
    if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false || 
        strpos($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json') !== false) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Authentication required',
            'login_url' => '/auth/login.php?redirect=' . urlencode($current_url)
        ]);
        exit;
    }
    
    // For web pages, redirect to login
    header('Location: /auth/login.php?redirect=' . urlencode($current_url));
    exit;
}

// User is authenticated, continue with request
// You can access user data via:
// $_SESSION['user_id']
// $_SESSION['user_email']
// $_SESSION['user_name']
// $_SESSION['user_picture']

