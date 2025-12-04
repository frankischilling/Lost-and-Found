<?php
require_once __DIR__ . '/../config.php';
// Configure session cookie for dev/prod and start session
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
	'secure' => !$isDev, // true in prod (https), false on localhost http
	'httponly' => true,
	'samesite' => $isDev ? 'Lax' : 'None',
]);
session_start();

// Generate CSRF state and store in session
$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;

// Optional return path for SPA after successful login
// Support both ?return_to= and legacy ?redirect= query param
$returnRaw = null;
if (isset($_GET['return_to'])) {
	$returnRaw = (string)$_GET['return_to'];
} elseif (isset($_GET['redirect'])) {
	$returnRaw = (string)$_GET['redirect'];
}
// Default if none provided: Home
$returnTo = $returnRaw !== null ? urldecode($returnRaw) : '/';
// Basic safety: ensure it starts with '/'
if ($returnTo === '' || $returnTo[0] !== '/') {
	$returnTo = '/';
}
$_SESSION['return_to'] = $returnTo;

// Store dev mode flag in session so callback knows which cookie domain to use
$_SESSION['oauth_dev_mode'] = $isDev;

// Pick redirect URI based on environment
$redirectUri = $isDev
	? 'http://localhost:5173/api/auth/callback.php'
	: 'https://project.frankhagan.online/auth/callback.php';

// Build Google OAuth URL
// Resolve Client ID from env or config.php
$clientId = getenv('GOOGLE_CLIENT_ID');
if (!$clientId && defined('GOOGLE_CLIENT_ID')) {
	$clientId = GOOGLE_CLIENT_ID;
}
if (!$clientId) {
	http_response_code(500);
	header('Content-Type: application/json');
	echo json_encode(['status' => 'error', 'message' => 'OAuth client_id not configured']);
	exit;
}

$params = [
	'client_id' => $clientId,
	'response_type' => 'code',
	'scope' => 'openid email profile',
	'redirect_uri' => $redirectUri,
	'state' => $state,
	'hd' => 'wit.edu', // domain hint (not enforced by Google)
];

// DEBUG MODE - Remove this after testing
if (isset($_GET['debug'])) {
	header('Content-Type: application/json');
	echo json_encode([
		'isDev' => $isDev,
		'host' => $host,
		'referer' => $referer,
		'redirect_uri' => $redirectUri,
		'session_id' => session_id(),
		'state' => $state,
		'oauth_dev_mode_stored' => $_SESSION['oauth_dev_mode'] ?? 'not set',
		'full_auth_url' => 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params)
	], JSON_PRETTY_PRINT);
	exit;
}

$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);

header('Location: ' . $authUrl);
exit;
/**
 * Google OAuth2 Login Endpoint
 * Initiates the OAuth2 flow by redirecting to Google's authorization page
 */

require_once __DIR__ . '/../config.php';

startSession();

// Get the redirect URL if provided (for redirecting after login)
$redirect_url = isset($_GET['redirect']) ? $_GET['redirect'] : '/';

// Store redirect URL in session for after authentication
$_SESSION['oauth_redirect'] = $redirect_url;

// Initialize Google Client
$client = new Google_Client();
$client->setClientId(GOOGLE_CLIENT_ID);
$client->setClientSecret(GOOGLE_CLIENT_SECRET);
$client->setRedirectUri(GOOGLE_REDIRECT_URI);
$client->addScope('https://www.googleapis.com/auth/userinfo.email');
$client->addScope('https://www.googleapis.com/auth/userinfo.profile');
$client->setAccessType('offline');
$client->setPrompt('select_account consent');

// Generate state token for CSRF protection
$state = bin2hex(random_bytes(16));
$_SESSION['oauth_state'] = $state;
$client->setState($state);

// Get authorization URL
$auth_url = $client->createAuthUrl();

// Redirect to Google
header('Location: ' . $auth_url);
exit;

