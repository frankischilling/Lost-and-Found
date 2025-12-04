<?php
require_once __DIR__ . '/config.php';

header('Cache-Control: public, max-age=3600');

$user_id = $_GET['user_id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    exit;
}

// Get user info
$user = null;
try {
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($db->connect_errno) {
        error_log('Avatar proxy DB error: ' . $db->connect_error);
    } else {
        $db->set_charset('utf8mb4');
        $stmt = $db->prepare('SELECT picture, name FROM users WHERE id = ? LIMIT 1');
        if ($stmt) {
            $stmt->bind_param('s', $user_id);
            if ($stmt->execute()) {
                $res = $stmt->get_result();
                $user = $res->fetch_assoc();
            }
            $stmt->close();
        }
        $db->close();
    }
} catch (Exception $e) {
    error_log('Avatar proxy exception: ' . $e->getMessage());
}

if (!$user) {
    // Generate a generic avatar if user not found
    $user = ['name' => 'User', 'picture' => null];
}

// Try to fetch from Google, but handle 429 gracefully
$picture_url = $user['picture'] ?? null;
if ($picture_url && function_exists('curl_init')) {
    $ch = @curl_init($picture_url);
    if ($ch) {
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 3,
            CURLOPT_CONNECTTIMEOUT => 2,
        ]);
        $data = @curl_exec($ch);
        $http_code = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
        
        if ($http_code === 200 && $data) {
            header('Content-Type: ' . $content_type);
            echo $data;
            exit;
        }
    }
}

// Fallback: generate SVG with initials
$name = $user['name'] ?? 'User';
$initials = '';
$parts = explode(' ', trim($name));
if (count($parts) >= 2) {
    $initials = strtoupper(substr($parts[0], 0, 1) . substr($parts[count($parts)-1], 0, 1));
} else {
    $initials = strtoupper(substr($name, 0, 2));
}

// Generate a color based on user_id for consistency
$hash = crc32($user_id);
$hue = $hash % 360;
$color = "hsl($hue, 60%, 50%)";

header('Content-Type: image/svg+xml');
echo <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" fill="$color"/>
  <text x="48" y="48" text-anchor="middle" dy=".35em" font-family="Arial, sans-serif" font-size="36" fill="white" font-weight="600">$initials</text>
</svg>
SVG;
