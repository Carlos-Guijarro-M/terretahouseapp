<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!empty($token)) {
    $stmt = $conn->prepare("UPDATE user SET api_token = NULL, token_expira = NULL WHERE api_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
}

echo json_encode(['message' => 'Sesión cerrada correctamente']);
?>