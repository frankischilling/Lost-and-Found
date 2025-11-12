<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

// UUID validation function
function isValidUUID($uuid) {
    return preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $uuid);
}

/**
 * Generate UUID v4
 */
function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, // Version 4
        mt_rand(0, 0x3fff) | 0x8000, // Variant bits
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

/**
 * Check if user is authenticated
 * Returns user_id if authenticated, false otherwise
 */
function requireAuth() {
    startSession();
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Authentication required',
            'login_url' => '/auth/login.php'
        ]);
        exit;
    }
    return $_SESSION['user_id'] ?? null;
}

/**
 * Check if user is admin
 * @param PDO $pdo Database connection
 * @param string $userId User ID to check
 * @return bool True if user is admin, false otherwise
 */
function isUserAdmin($pdo, $userId) {
    try {
        // First, try to get role field (primary method)
        $stmt = $pdo->prepare('SELECT role FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && isset($user['role']) && $user['role'] !== null) {
            $role = trim(strtolower($user['role']));
            if ($role === 'admin') {
                return true;
            }
        }
        
        // If role check didn't work, try is_admin field (fallback for older schemas)
        try {
            $stmt = $pdo->prepare('SELECT is_admin FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$userId]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user && isset($user['is_admin'])) {
                $isAdminBool = $user['is_admin'];
                if ($isAdminBool === true || $isAdminBool === 1 || $isAdminBool === '1') {
                    return true;
                }
            }
        } catch (PDOException $e) {
            // is_admin column doesn't exist, that's fine - we're using role
        }
        
        return false;
    } catch (PDOException $e) {
        error_log("isUserAdmin error for user $userId: " . $e->getMessage());
        return false;
    }
}

try {
    $pdo = getDBConnection();
    
    if ($pdo === null) {
        throw new Exception('Failed to connect to database');
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed. Only POST is supported.'
        ]);
        exit;
    }
    
    // Require authentication
    $userId = requireAuth();
    if (!$userId) {
        exit; // requireAuth already sent response
    }
    
    // Check if files were uploaded
    // PHP normalizes 'photos[]' from FormData to 'photos'
    if (!isset($_FILES['photos']) || empty($_FILES['photos']['name'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'No photos uploaded. Please select at least one photo file.'
        ]);
        exit;
    }
    
    $files = $_FILES['photos'];
    
    // Optional: Check post ownership if post_id is provided
    $postId = isset($_POST['post_id']) ? trim($_POST['post_id']) : null;
    if ($postId && isValidUUID($postId)) {
        // Verify post exists and user has permission to add photos
        $checkStmt = $pdo->prepare('SELECT id, user_id FROM posts WHERE id = ?');
        $checkStmt->execute([$postId]);
        $existingPost = $checkStmt->fetch();
        
        if (!$existingPost) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Post not found'
            ]);
            exit;
        }
        
        // Check if user owns the post or is admin
        $isAdmin = isUserAdmin($pdo, $userId);
        $isOwner = ($existingPost['user_id'] !== null && strtolower(trim($existingPost['user_id'])) === strtolower(trim($userId)));
        
        if (!$isOwner && !$isAdmin) {
            http_response_code(403);
            echo json_encode([
                'status' => 'error',
                'message' => 'You do not have permission to add photos to this post. Only the post creator or admins can add photos.'
            ]);
            exit;
        }
    }
    
    // Create uploads directory if it doesn't exist
    $uploadDir = __DIR__ . '/uploads/photos/';
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to create upload directory'
            ]);
            exit;
        }
    }
    
    // Allowed file types
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $maxFileSize = 10 * 1024 * 1024; // 10MB
    
    // Handle single or multiple file uploads
    $isMultiple = is_array($files['name']);
    
    if (!$isMultiple) {
        // Single file - convert to array format for uniform processing
        $files = [
            'name' => [$files['name']],
            'type' => [$files['type']],
            'tmp_name' => [$files['tmp_name']],
            'error' => [$files['error']],
            'size' => [$files['size']]
        ];
    }
    
    $uploadedPhotos = [];
    $errors = [];
    
    foreach ($files['name'] as $index => $fileName) {
        // Skip empty file slots
        if (empty($fileName)) {
            continue;
        }
        
        $fileType = $files['type'][$index];
        $fileTmpName = $files['tmp_name'][$index];
        $fileError = $files['error'][$index];
        $fileSize = $files['size'][$index];
        
        // Check for upload errors
        if ($fileError !== UPLOAD_ERR_OK) {
            $errors[] = "File '$fileName': Upload error code $fileError";
            continue;
        }
        
        // Validate file type
        if (!in_array($fileType, $allowedTypes)) {
            $errors[] = "File '$fileName': Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.";
            continue;
        }
        
        // Validate file size
        if ($fileSize > $maxFileSize) {
            $errors[] = "File '$fileName': File size exceeds 10MB limit.";
            continue;
        }
        
        // Generate UUID for the photo
        $photoUuid = generateUUID();
        
        // Get file extension from original filename
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        if (empty($fileExtension)) {
            // Default to jpg if no extension
            $fileExtension = 'jpg';
        }
        
        // Create filename with UUID
        $newFileName = $photoUuid . '.' . $fileExtension;
        $targetPath = $uploadDir . $newFileName;
        
        // Move uploaded file
        if (!move_uploaded_file($fileTmpName, $targetPath)) {
            $errors[] = "File '$fileName': Failed to save file.";
            continue;
        }
        
        // Store photo information
        $uploadedPhotos[] = [
            'uuid' => $photoUuid,
            'original_name' => $fileName,
            'filename' => $newFileName,
            'url' => '/uploads/photos/' . $newFileName,
            'size' => $fileSize,
            'type' => $fileType
        ];
    }
    
    if (empty($uploadedPhotos) && !empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to upload photos',
            'errors' => $errors
        ]);
        exit;
    }
    
    // Return success response
    $response = [
        'status' => 'success',
        'message' => count($uploadedPhotos) . ' photo(s) uploaded successfully',
        'photos' => $uploadedPhotos
    ];
    
    // If there were some errors but some photos succeeded, include them
    if (!empty($errors)) {
        $response['warnings'] = $errors;
    }
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

