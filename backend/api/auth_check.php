<?php
// Manejo de preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? '';
$token = str_replace('Bearer ', '', $authHeader);

$stmt = $conn->prepare("SELECT id, roles FROM user WHERE api_token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    http_response_code(401);
    echo json_encode(['message' => 'No autorizado']);
    exit;
}

$userId = $user['id'];
$userRoles = json_decode($user['roles'], true);
?>