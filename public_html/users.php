<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
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
        // This handles the case where only 'role' column exists
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
                // Handle different return types from MySQL
                if ($isAdminBool === true || $isAdminBool === 1 || $isAdminBool === '1') {
                    return true;
                }
            }
        } catch (PDOException $e) {
            // is_admin column doesn't exist, that's fine - we're using role
        }
        
        return false;
    } catch (PDOException $e) {
        // If query fails, assume user is not admin
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
    $id = isset($_GET['id']) ? trim($_GET['id']) : null;
    
    switch ($method) {
        case 'GET':
            startSession();
            
            if ($id !== null && isValidUUID($id)) {
                // Get single user by ID
                // Users can view their own profile, admins can view any profile
                $currentUserId = isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true ? $_SESSION['user_id'] : null;
                
                if (!$currentUserId) {
                    http_response_code(401);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Authentication required to view user profiles'
                    ]);
                    exit;
                }
                
                $isAdmin = isUserAdmin($pdo, $currentUserId);
                
                // Check if user is viewing their own profile or is admin
                if ($id !== $currentUserId && !$isAdmin) {
                    http_response_code(403);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'You do not have permission to view this user profile'
                    ]);
                    exit;
                }
                
                $stmt = $pdo->prepare('SELECT id, google_id, email, name, picture, phone, created_at, updated_at, last_login, role FROM users WHERE id = ?');
                $stmt->execute([$id]);
                $user = $stmt->fetch();
                
                if ($user) {
                    // Don't expose sensitive fields to non-admins viewing other profiles
                    if (!$isAdmin && $id !== $currentUserId) {
                        unset($user['google_id']);
                    }
                    http_response_code(200);
                    echo json_encode($user);
                } else {
                    http_response_code(404);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'User not found'
                    ]);
                }
            } else {
                // Get all users - admin only
                $currentUserId = requireAuth();
                if (!$currentUserId) {
                    exit; // requireAuth already sent response
                }
                
                $isAdmin = isUserAdmin($pdo, $currentUserId);
                
                if (!$isAdmin) {
                    http_response_code(403);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Admin access required to list all users'
                    ]);
                    exit;
                }
                
                $stmt = $pdo->query('SELECT id, google_id, email, name, picture, phone, created_at, updated_at, last_login, role FROM users ORDER BY created_at DESC');
                $users = $stmt->fetchAll();
                
                http_response_code(200);
                echo json_encode([
                    'status' => 'success',
                    'count' => count($users),
                    'users' => $users
                ]);
            }
            break;
            
        case 'PUT':
            // Update user - users can update their own profile, admins can update any profile
            $currentUserId = requireAuth();
            if (!$currentUserId) {
                exit; // requireAuth already sent response
            }
            
            if ($id === null || !isValidUUID($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid User ID (UUID) is required'
                ]);
                exit;
            }
            
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!$data) {
                parse_str(file_get_contents('php://input'), $data);
            }
            
            // Check if user exists
            $checkStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'User not found'
                ]);
                exit;
            }
            
            $isAdmin = isUserAdmin($pdo, $currentUserId);
            
            // Check if user is updating their own profile or is admin
            if ($id !== $currentUserId && !$isAdmin) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'You do not have permission to update this user profile'
                ]);
                exit;
            }
            
            $updates = [];
            $params = [];
            
            // Users can update these fields
            if (isset($data['name'])) {
                $updates[] = 'name = ?';
                $params[] = trim($data['name']);
            }
            
            if (isset($data['picture'])) {
                $updates[] = 'picture = ?';
                $params[] = trim($data['picture']);
            }
            
            if (isset($data['phone'])) {
                $phone = trim($data['phone']);
                // Basic phone validation
                if (preg_match('/^[0-9\-\+\(\)\s]+$/', $phone) && strlen($phone) <= 20) {
                    $updates[] = 'phone = ?';
                    $params[] = $phone;
                } else {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Invalid phone number format'
                    ]);
                    exit;
                }
            }
            
            // Only admins can update these fields
            if ($isAdmin) {
                if (isset($data['email'])) {
                    $email = trim($data['email']);
                    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                        // Check if email already exists for another user
                        $emailCheck = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
                        $emailCheck->execute([$email, $id]);
                        if ($emailCheck->fetch()) {
                            http_response_code(400);
                            echo json_encode([
                                'status' => 'error',
                                'message' => 'Email already in use'
                            ]);
                            exit;
                        }
                        $updates[] = 'email = ?';
                        $params[] = $email;
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Invalid email format'
                        ]);
                        exit;
                    }
                }
                
                if (isset($data['role'])) {
                    if (in_array(strtolower($data['role']), ['user', 'admin'])) {
                        $updates[] = 'role = ?';
                        $params[] = strtolower($data['role']);
                    }
                }
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'No fields to update'
                ]);
                exit;
            }
            
            $updates[] = 'updated_at = NOW()';
            $params[] = $id;
            
            $sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'User updated successfully'
            ]);
            break;
            
        case 'DELETE':
            // Delete user - admin only, or users can delete their own account
            $currentUserId = requireAuth();
            if (!$currentUserId) {
                exit; // requireAuth already sent response
            }
            
            if ($id === null || !isValidUUID($id)) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Valid User ID (UUID) is required'
                ]);
                exit;
            }
            
            // Check if user exists
            $checkStmt = $pdo->prepare('SELECT id FROM users WHERE id = ?');
            $checkStmt->execute([$id]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'User not found'
                ]);
                exit;
            }
            
            $isAdmin = isUserAdmin($pdo, $currentUserId);
            
            // Check if user is deleting their own account or is admin
            if ($id !== $currentUserId && !$isAdmin) {
                http_response_code(403);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'You do not have permission to delete this user'
                ]);
                exit;
            }
            
            // Prevent deleting the last admin
            if ($isAdmin && $id === $currentUserId) {
                $adminCount = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'admin'")->fetch();
                if ($adminCount['count'] <= 1) {
                    http_response_code(400);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Cannot delete the last admin user'
                    ]);
                    exit;
                }
            }
            
            $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
            $stmt->execute([$id]);
            
            http_response_code(200);
            echo json_encode([
                'status' => 'success',
                'message' => 'User deleted successfully'
            ]);
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'status' => 'error',
                'message' => 'Method not allowed'
            ]);
            break;
    }
    
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

