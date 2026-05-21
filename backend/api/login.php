<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Obtenemos los roles de la base de datos
$stmt = $conn->prepare("SELECT id, email, password, api_token, roles FROM user WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    
    // Generar token si está vacío
    if (empty($user['api_token'])) {
        $token = bin2hex(random_bytes(32));
        $update = $conn->prepare("UPDATE user SET api_token = ? WHERE id = ?");
        $update->bind_param("si", $token, $user['id']);
        $update->execute();
        $user['api_token'] = $token;
    }

    // Devolver datos al frontend (incluyendo los roles como array)
    echo json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'api_token' => $user['api_token'],
        'roles' => json_decode($user['roles']) 
    ]);
} else {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciales incorrectas']);
}