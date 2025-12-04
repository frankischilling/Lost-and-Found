<?php
require_once __DIR__ . '/../config.php';

// First start session with generic params to read the oauth_dev_mode flag
session_start();

// Check if this OAuth flow was initiated in dev mode (stored by login.php)
$isDev = isset($_SESSION['oauth_dev_mode']) && $_SESSION['oauth_dev_mode'] === true;

// Debug logging
error_log('Callback - Session ID: ' . session_id());
error_log('Callback - isDev from session: ' . ($isDev ? 'true' : 'false'));
error_log('Callback - oauth_state in session: ' . (isset($_SESSION['oauth_state']) ? 'yes' : 'no'));
error_log('Callback - state from GET: ' . ($_GET['state'] ?? 'missing'));

// Now restart session with correct cookie params for the detected environment
session_write_close();
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => $isDev ? 'localhost' : 'project.frankhagan.online',
    'secure' => !$isDev,
    'httponly' => true,
    'samesite' => $isDev ? 'Lax' : 'None',
]);
session_start();

header('Content-Type: application/json');

// Validate CSRF state
if (!isset($_GET['state']) || !hash_equals($_SESSION['oauth_state'] ?? '', $_GET['state'])) {
    http_response_code(400);
    error_log('Callback - State validation failed');
    echo json_encode(['status' => 'error', 'message' => 'Invalid state parameter. Possible CSRF attack.', 'debug' => [
        'has_session_state' => isset($_SESSION['oauth_state']),
        'has_get_state' => isset($_GET['state']),
        'session_id' => session_id(),
        'isDev' => $isDev
    ]]);
    exit;
}
unset($_SESSION['oauth_state']);

// Ensure we have an authorization code
if (!isset($_GET['code'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing authorization code.']);
    exit;
}

$code = $_GET['code'];

// Exchange code for tokens with Google (server-side)
// NOTE: Replace with your current token exchange implementation
$clientId = getenv('GOOGLE_CLIENT_ID');
$clientSecret = getenv('GOOGLE_CLIENT_SECRET');
if (!$clientId && defined('GOOGLE_CLIENT_ID')) {
    $clientId = GOOGLE_CLIENT_ID;
}
if (!$clientSecret && defined('GOOGLE_CLIENT_SECRET')) {
    $clientSecret = GOOGLE_CLIENT_SECRET;
}
if (!$clientId || !$clientSecret) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'OAuth client credentials not configured']);
    exit;
}
$redirectUri = $isDev
    ? 'http://localhost:5173/api/auth/callback.php'
    : 'https://project.frankhagan.online/auth/callback.php';

$tokenResponse = null;
try {
    $ch = curl_init('https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'code' => $code,
        'client_id' => $clientId,
        'client_secret' => $clientSecret,
        'redirect_uri' => $redirectUri,
        'grant_type' => 'authorization_code',
    ]));
    $resp = curl_exec($ch);
    if ($resp === false) {
        throw new Exception('Token request failed: ' . curl_error($ch));
    }
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status < 200 || $status >= 300) {
        throw new Exception('Token request HTTP ' . $status . ': ' . $resp);
    }
    $tokenResponse = json_decode($resp, true);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Token exchange failed', 'detail' => $e->getMessage()]);
    exit;
}

// Fetch user info from Google
$accessToken = $tokenResponse['access_token'] ?? null;
if (!$accessToken) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Missing access token']);
    exit;
}

try {
    $ch = curl_init('https://www.googleapis.com/oauth2/v3/userinfo');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $accessToken]);
    $resp = curl_exec($ch);
    if ($resp === false) {
        throw new Exception('Userinfo request failed: ' . curl_error($ch));
    }
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($status < 200 || $status >= 300) {
        throw new Exception('Userinfo request HTTP ' . $status . ': ' . $resp);
    }
    $userinfo = json_decode($resp, true);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch user info', 'detail' => $e->getMessage()]);
    exit;
}

// Enforce domain restriction (wit.edu)
$email = $userinfo['email'] ?? '';
if (!preg_match('/@wit\.edu$/i', $email)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Email domain not allowed']);
    exit;
}

// Fetch or create user in database
$pdo = getDBConnection();
$googleId = $userinfo['sub'] ?? '';
$userRole = 'user'; // default
$userId = null;

if ($pdo && $googleId) {
    try {
        // First check if user exists
        $stmt = $pdo->prepare("SELECT id, role FROM users WHERE google_id = ?");
        $stmt->execute([$googleId]);
        $dbUser = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($dbUser) {
            // Existing user - get their database UUID and role
            $userId = $dbUser['id'];
            $userRole = $dbUser['role'] ?? 'user';
            
            // Update last login time
            $updateStmt = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $updateStmt->execute([$userId]);
        } else {
            // New user - create with UUID
            $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
                mt_rand(0, 0xffff), mt_rand(0, 0xffff),
                mt_rand(0, 0xffff),
                mt_rand(0, 0x0fff) | 0x4000,
                mt_rand(0, 0x3fff) | 0x8000,
                mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
            );
            
            $insertStmt = $pdo->prepare("
                INSERT INTO users (id, google_id, email, name, picture, role, created_at, last_login)
                VALUES (?, ?, ?, ?, ?, 'user', NOW(), NOW())
            ");
            $insertStmt->execute([
                $userId,
                $googleId,
                $email,
                $userinfo['name'] ?? '',
                $userinfo['picture'] ?? ''
            ]);
        }
    } catch (Exception $e) {
        error_log("Failed to fetch/create user: " . $e->getMessage());
    }
}

// Persist user in session using database UUID as the primary ID
$_SESSION['user'] = [
    'id' => $userId,  // Database UUID
    'google_id' => $googleId,  // Keep Google ID for reference
    'email' => $email,
    'name' => $userinfo['name'] ?? '',
    'picture' => $userinfo['picture'] ?? '',
    'role' => $userRole,
];

// Set session fields using database UUID as primary identifier
$_SESSION['logged_in'] = true;
$_SESSION['user_id'] = $userId;  // Now stores database UUID instead of Google ID
$_SESSION['user_email'] = $email;
$_SESSION['user_name'] = $userinfo['name'] ?? '';
$_SESSION['user_picture'] = $userinfo['picture'] ?? '';

// Redirect back to SPA (path controlled by session 'return_to')
$spaOrigin = $isDev ? 'http://localhost:5173' : 'https://project.frankhagan.online';
$returnTo = isset($_SESSION['return_to']) ? (string)$_SESSION['return_to'] : '/';
if ($returnTo === '' || $returnTo[0] !== '/') {
    $returnTo = '/';
}
unset($_SESSION['return_to']);
header('Location: ' . $spaOrigin . $returnTo);
exit;

