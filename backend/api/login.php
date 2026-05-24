<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

// leer los datos enviados por el frontend
$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';


$stmt = $conn->prepare("SELECT id, email, password, api_token, roles FROM user WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    
    if (empty($user['api_token'])) {
        $nuevoToken = "token_" . uniqid(); 
        $update = $conn->prepare("UPDATE user SET api_token = ? WHERE id = ?");
        $update->bind_param("si", $nuevoToken, $user['id']);
        $update->execute();
        $user['api_token'] = $nuevoToken;
    }

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
?>