<?php
/**
 * Google OAuth2 Callback Endpoint
 * Handles the callback from Google after user authorization
 */

require_once __DIR__ . '/../config.php';

startSession();

// Verify state token (CSRF protection)
if (!isset($_GET['state']) || !isset($_SESSION['oauth_state']) || $_GET['state'] !== $_SESSION['oauth_state']) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid state parameter. Possible CSRF attack.'
    ]);
    exit;
}

// Clear state token
unset($_SESSION['oauth_state']);

// Check for authorization code
if (!isset($_GET['code'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Authorization code not provided'
    ]);
    exit;
}

try {
    // Initialize Google Client
    $client = new Google_Client();
    $client->setClientId(GOOGLE_CLIENT_ID);
    $client->setClientSecret(GOOGLE_CLIENT_SECRET);
    $client->setRedirectUri(GOOGLE_REDIRECT_URI);
    $client->addScope('https://www.googleapis.com/auth/userinfo.email');
    $client->addScope('https://www.googleapis.com/auth/userinfo.profile');

    // Exchange authorization code for access token
    $token = $client->fetchAccessTokenWithAuthCode($_GET['code']);

    if (isset($token['error'])) {
        throw new Exception('Error fetching access token: ' . $token['error']);
    }

    $client->setAccessToken($token);

    // Get user info from Google
    $oauth2 = new Google_Service_Oauth2($client);
    $userInfo = $oauth2->userinfo->get();

    // Extract user data
    $googleId = $userInfo->getId();
    $email = $userInfo->getEmail();
    $name = $userInfo->getName();
    $picture = $userInfo->getPicture();

    // Validate email domain - only allow @wit.edu emails
    $emailLower = strtolower($email);
    $allowedDomain = strtolower(ALLOWED_EMAIL_DOMAIN);
    if (substr($emailLower, -strlen($allowedDomain)) !== $allowedDomain) {
        http_response_code(403);
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>Access Denied</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 100px auto;
                    padding: 20px;
                    background: #f5f5f5;
                }
                .error-box {
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    text-align: center;
                }
                h1 { color: #d32f2f; margin-top: 0; }
                p { color: #666; line-height: 1.6; }
                .email { font-weight: bold; color: #333; }
                .domain { color: #1976d2; }
                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #1976d2;
                    color: white;
                    text-decoration: none;
                    border-radius: 4px;
                }
                a:hover { background: #1565c0; }
            </style>
        </head>
        <body>
            <div class="error-box">
                <h1>❌ Access Denied</h1>
                <p>This application is restricted to <span class="domain">@wit.edu</span> email addresses only.</p>
                <p>You attempted to sign in with: <span class="email"><?php echo htmlspecialchars($email); ?></span></p>
                <p>Please use a Wentworth Institute of Technology email address to access this application.</p>
                <a href="/">Return to Home</a>
            </div>
        </body>
        </html>
        <?php
        exit;
    }

    // Get database connection
    $pdo = getDBConnection();
    if ($pdo === null) {
        throw new Exception('Failed to connect to database');
    }

    // Check if user exists
    $stmt = $pdo->prepare('SELECT * FROM users WHERE google_id = ? OR email = ?');
    $stmt->execute([$googleId, $email]);
    $user = $stmt->fetch();

    if ($user) {
        // Update existing user
        $userId = $user['id'];
        $stmt = $pdo->prepare('UPDATE users SET google_id = ?, name = ?, picture = ?, last_login = NOW(), updated_at = NOW() WHERE id = ?');
        $stmt->execute([$googleId, $name, $picture, $userId]);
    } else {
        // Create new user
        $userId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
            mt_rand(0, 0xffff), mt_rand(0, 0xffff),
            mt_rand(0, 0xffff),
            mt_rand(0, 0x0fff) | 0x4000,
            mt_rand(0, 0x3fff) | 0x8000,
            mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
        );
        
        $stmt = $pdo->prepare('INSERT INTO users (id, google_id, email, name, picture, last_login) VALUES (?, ?, ?, ?, ?, NOW())');
        $stmt->execute([$userId, $googleId, $email, $name, $picture]);
    }

    // Set session variables
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_name'] = $name;
    $_SESSION['user_picture'] = $picture;
    $_SESSION['logged_in'] = true;

    // Get redirect URL from session
    $redirect_url = isset($_SESSION['oauth_redirect']) ? $_SESSION['oauth_redirect'] : '/';
    unset($_SESSION['oauth_redirect']);

    // Redirect to the original destination or home
    header('Location: ' . $redirect_url);
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Authentication failed: ' . $e->getMessage()
    ]);
    exit;
}

