<?php
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

