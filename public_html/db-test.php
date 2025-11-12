<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    if ($pdo === null) {
        throw new Exception('Failed to connect to database');
    }
    
    // Test query
    $stmt = $pdo->query('SELECT 1 as test');
    $result = $stmt->fetch();
    
    // Check if database exists and is accessible
    $dbName = $pdo->query('SELECT DATABASE() as dbname')->fetch()['dbname'];
    
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'database' => $dbName,
        'server_info' => $pdo->getAttribute(PDO::ATTR_SERVER_INFO),
        'timestamp' => date('c')
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage(),
        'timestamp' => date('c')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'timestamp' => date('c')
    ]);
}

