<?php
require_once '../includes/db.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';

if ($action === 'register') {
    $email = $data['email'] ?? '';
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    $roles = ($email === 'admin@gmail.com') ? json_encode(['ROLE_ADMIN']) : json_encode(['ROLE_USER']);

    $stmt = $conn->prepare("INSERT INTO user (email, password, roles) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $password, $roles);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Usuario registrado']);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Error al registrar']);
    }
}
elseif ($action === 'login') {
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $conn->prepare("SELECT id, password FROM user WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        $token = uniqid('token_', true);
        $stmt = $conn->prepare("UPDATE user SET api_token = ? WHERE id = ?");
        $stmt->bind_param("si", $token, $user['id']);
        $stmt->execute();

        echo json_encode(['token' => $token, 'message' => 'Login exitoso']);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Credenciales incorrectas']);
    }
}
?>