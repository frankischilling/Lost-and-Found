<?php
// Require Composer autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', '');
define('DB_USER', '');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Google OAuth2 configuration
define('GOOGLE_CLIENT_ID', '');
define('GOOGLE_CLIENT_SECRET', '');
define('GOOGLE_REDIRECT_URI', 'https://project.frankhagan.online/auth/callback.php');

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
        // Detect dev via headers/host similar to API endpoints
        $host = $_SERVER['HTTP_HOST'] ?? '';
        $referer = $_SERVER['HTTP_REFERER'] ?? '';
        $devHeader = $_SERVER['HTTP_X_DEV_MODE'] ?? '';
        $forwardedHost = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? '';
        $isDev = ($devHeader === 'true') || str_contains($forwardedHost, 'localhost') || str_contains($host, 'localhost') || str_contains($referer, 'localhost');

        // Align server GC with cookie lifetime so sessions don't disappear early
        @ini_set('session.gc_maxlifetime', (string)SESSION_LIFETIME);
        // Improve chance GC runs (keep defaults reasonable)
        @ini_set('session.gc_probability', '1');
        @ini_set('session.gc_divisor', '100');
        @ini_set('session.cookie_lifetime', (string)SESSION_LIFETIME);

        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path' => '/',
            'domain' => $isDev ? 'localhost' : 'project.frankhagan.online',
            'secure' => !$isDev,
            'httponly' => true,
            'samesite' => $isDev ? 'Lax' : 'None',
        ]);
        session_start();
    }
}

/**
 * Set CORS headers
 * Allows requests from production domain and localhost:5173 (Vite dev server)
 */
function setCORSHeaders() {
    $allowedOrigins = [
        'https://project.frankhagan.online',
        // Common local dev origins
        'http://localhost',
        'https://localhost',
        'http://localhost:5173',
        'https://localhost:5173',
        'http://127.0.0.1',
        'https://127.0.0.1',
        'http://127.0.0.1:5173',
        'https://127.0.0.1:5173',
    ];
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    // Allow any localhost/127.0.0.1 origin dynamically (any port)
    $isLocalhost = $origin && (str_contains($origin, 'localhost') || str_contains($origin, '127.0.0.1'));
    $isAllowedOrigin = in_array($origin, $allowedOrigins) || $isLocalhost;
    if ($isAllowedOrigin) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    } else {
        // Fallback to allow all origins for non-credentialed dev requests
        // Note: Credentials are not allowed with wildcard origin
        header('Access-Control-Allow-Origin: *');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    // Allow common headers used by fetch and auth
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
}

