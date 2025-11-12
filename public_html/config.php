<?php
// Require Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', '');
define('DB_USER', ''); // Update with your database username
define('DB_PASS', ''); // Update with your database password
define('DB_CHARSET', 'utf8mb4');

// Google OAuth2 configuration
// TODO: Replace these with your actual Google OAuth2 credentials
// Get these from: https://console.cloud.google.com/apis/credentials
define('GOOGLE_CLIENT_ID', '');
define('GOOGLE_CLIENT_SECRET', '');
define('GOOGLE_REDIRECT_URI', '');

// Session configuration
define('SESSION_LIFETIME', 3600 * 24 * 7); // 7 days

// Email domain restriction
define('ALLOWED_EMAIL_DOMAIN', '@wit.edu'); // Only allow this email domain

/**
 * Get database connection
 * @return PDO|null
 */
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        return null;
    }
}

/**
 * Start session if not already started
 */
function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'domain' => '',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
        session_start();
    }
}

