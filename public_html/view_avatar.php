<?php
require_once __DIR__ . '/config.php';

// Diagnostics: capture warnings/notices/fatals into log.txt
error_reporting(E_ALL);
ini_set('display_errors', '0');
function log_error(string $msg): void {
    $file = __DIR__ . '/log.txt';
    $line = '[' . date('c') . "] view_avatar.php: " . $msg . "\n";
    @file_put_contents($file, $line, FILE_APPEND);
}
set_error_handler(function ($severity, $message, $file, $line) {
    log_error("PHP error [$severity] $message at $file:$line");
});
set_exception_handler(function ($ex) {
    log_error('Uncaught exception: ' . $ex->getMessage());
});
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        log_error('Fatal error: ' . $err['message'] . ' at ' . $err['file'] . ':' . $err['line']);
    }
});
// log_error defined above

// Simple host whitelist to avoid SSRF
function ends_with(string $haystack, string $needle): bool {
    $len = strlen($needle);
    if ($len === 0) return true;
    return substr($haystack, -$len) === $needle;
}

function is_allowed_host(string $url): bool {
    $host = parse_url($url, PHP_URL_HOST);
    if (!$host) return false;
    $allowed = [
        'lh3.googleusercontent.com',
        'googleusercontent.com',
        'avatars.githubusercontent.com',
    ];
    foreach ($allowed as $a) {
        if ($host === $a || ends_with($host, '.' . $a)) return true;
    }
    return false;
}

function respond404() {
    http_response_code(404);
    header('Content-Type: text/plain');
    echo 'Avatar not found';
    exit;
}

function db(): mysqli {
    global $DB_HOST, $DB_USER, $DB_PASS, $DB_NAME;
    $mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
    if ($mysqli->connect_errno) {
        log_error('DB connection failed: ' . $mysqli->connect_error);
        http_response_code(500);
        echo 'Server error';
        exit;
    }
    $mysqli->set_charset('utf8mb4');
    return $mysqli;
}

function get_avatar_row(mysqli $db, string $user_id): ?array {
    $sql = 'SELECT user_id, source_url, local_path, content_type, last_fetched_at FROM user_avatars WHERE user_id = ? LIMIT 1';
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        // Table might not exist yet; treat as cache miss
        return null;
    }
    $stmt->bind_param('s', $user_id);
    if (!$stmt->execute()) {
        $stmt->close();
        return null;
    }
    $res = $stmt->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt->close();
    return $row ?: null;
}

function upsert_avatar(mysqli $db, string $user_id, string $source_url, string $local_path, string $content_type): void {
    $sql = 'INSERT INTO user_avatars (user_id, source_url, local_path, content_type, last_fetched_at) VALUES (?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE source_url = VALUES(source_url), local_path = VALUES(local_path), content_type = VALUES(content_type), last_fetched_at = NOW()';
    $stmt = $db->prepare($sql);
    if (!$stmt) return; // silently skip if table missing
    $stmt->bind_param('ssss', $user_id, $source_url, $local_path, $content_type);
    @$stmt->execute();
    $stmt->close();
}

function get_user_picture_source(mysqli $db, string $user_id): ?string {
    $stmt = $db->prepare('SELECT picture FROM users WHERE id = ? LIMIT 1');
    if (!$stmt) return null;
    $stmt->bind_param('s', $user_id);
    if (!$stmt->execute()) {
        $stmt->close();
        return null;
    }
    $res = $stmt->get_result();
    $row = $res ? $res->fetch_assoc() : null;
    $stmt->close();
    return $row && !empty($row['picture']) ? $row['picture'] : null;
}

function ensure_dir(string $path): void {
    if (!is_dir($path)) {
        if (!@mkdir($path, 0775, true)) {
            log_error('Failed to create directory: ' . $path);
        }
    }
}

function fetch_and_store(string $url, string $destPath): ?array {
    $data = null;
    $content_type = null;
    $http_code = 0;
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if (!$ch) {
            log_error('curl_init failed');
            return null;
        }
        curl_setopt_array($ch, [
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_MAXREDIRS => 3,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_USERAGENT => 'LostAndFoundAvatarCache/1.0',
            CURLOPT_HTTPHEADER => ['Accept: image/*'],
        ]);
        $data = curl_exec($ch);
        if ($data === false) {
            log_error('curl_exec error: ' . curl_error($ch));
        }
        $http_code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $content_type = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
        curl_close($ch);
    } else {
        // Fallback to file_get_contents with stream context
        $ctx = stream_context_create([
            'http' => [
                'method' => 'GET',
                'timeout' => 5,
                'header' => "User-Agent: LostAndFoundAvatarCache/1.0\r\nAccept: image/*\r\n",
            ],
        ]);
        $data = @file_get_contents($url, false, $ctx);
        // Best-effort: content type may be unavailable
        $http_code = $data !== false ? 200 : 0;
    }
    if ($http_code !== 200 || !$data) return null;
    // Determine content type via finfo if unknown
    if (!$content_type) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $content_type = $finfo->buffer($data) ?: 'image/jpeg';
    }
    if (!preg_match('/^image\/(jpeg|jpg|png|gif|webp)$/i', (string)$content_type)) return null;
    if (strlen($data) > 2 * 1024 * 1024) return null; // 2MB limit

    // choose extension
    $ext = 'jpg';
    if (stripos($content_type, 'png') !== false) $ext = 'png';
    elseif (stripos($content_type, 'webp') !== false) $ext = 'webp';
    elseif (stripos($content_type, 'gif') !== false) $ext = 'gif';

    $finalPath = $destPath . '.' . $ext;
    // write atomically
    $tmp = $finalPath . '.tmp';
    if (file_put_contents($tmp, $data) === false) {
        log_error('Failed to write temp file: ' . $tmp);
        return null;
    }
    if (!@rename($tmp, $finalPath)) {
        @unlink($tmp);
        log_error('Failed to move temp to final: ' . $finalPath);
        return null;
    }
    return ['path' => $finalPath, 'content_type' => $content_type];
}

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : null;
if (!$user_id) {
    log_error('No user_id provided');
    http_response_code(400);
    echo 'Missing user_id';
    exit;
}

log_error("Avatar request for user_id: $user_id");

$db = db();
$cacheDir = __DIR__ . '/uploads/avatars';
ensure_dir($cacheDir);
$baseName = $cacheDir . '/' . preg_replace('/[^a-zA-Z0-9_-]/', '_', $user_id);

$row = get_avatar_row($db, $user_id);
$now = time();
$needs_refresh = true;
$local_path = $row['local_path'] ?? null;
$content_type = $row['content_type'] ?? null;
$source_url = $row['source_url'] ?? null;

if ($local_path && file_exists($local_path)) {
    $needs_refresh = false;
    if (!empty($row['last_fetched_at'])) {
        $last = strtotime($row['last_fetched_at']);
        if ($last && ($now - $last) > (7 * 24 * 60 * 60)) {
            $needs_refresh = true; // older than 7 days
        }
    }
}

if (!$source_url) {
    $source_url = get_user_picture_source($db, $user_id);
    log_error("Source URL from DB: " . ($source_url ?: 'NULL'));

// If DB points to missing file but a cached variant exists with any extension, use it
if (!$local_path || !file_exists($local_path)) {
    foreach (['jpg','png','webp','gif'] as $ext) {
        $candidate = $baseName . '.' . $ext;
        if (file_exists($candidate)) {
            $local_path = $candidate;
            // best-effort content type
            $map = ['jpg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];
            $content_type = $map[$ext];
            break;
        }
    }
}

if ($needs_refresh && $source_url && is_allowed_host($source_url)) {
    log_error("Attempting to fetch from: $source_url");
    $stored = fetch_and_store($source_url, $baseName);
    if ($stored) {
        $local_path = $stored['path'];
        $content_type = $stored['content_type'];
        log_error("Successfully cached to: $local_path");
        upsert_avatar($db, $user_id, $source_url, $local_path, $content_type);
    } else {
        log_error('Failed to fetch/store avatar from ' . $source_url);
    }
} elseif (!$source_url) {
    log_error('No source URL available');
} elseif (!is_allowed_host($source_url)) {
    log_error('Host not allowed: ' . parse_url($source_url, PHP_URL_HOST));
}

if (!$local_path || !file_exists($local_path)) {
    log_error('Local avatar missing for user ' . $user_id);
    respond404();
}

header('Content-Type: ' . ($content_type ?: 'image/jpeg'));
header('Cache-Control: public, max-age=86400');
header('Content-Length: ' . filesize($local_path));
readfile($local_path);
