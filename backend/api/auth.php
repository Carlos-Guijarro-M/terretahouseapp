<?php
require_once '../includes/db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$action = isset($_GET['action']) ? $_GET['action'] : '';

//Registro de usuario
if ($action === 'register') {
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);
    
    $rol = ($email === 'admin@gmail.com') ? json_encode(['ROLE_ADMIN']) : json_encode(['ROLE_USER']);

    $stmt = $conn->prepare("INSERT INTO user (email, password, roles) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $email, $password, $rol);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Usuario registrado correctamente']);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Error al registrar el usuario']);
    }
}

// Login de usuario
elseif ($action === 'login') {
    $email = $data['email'];
    $password = $data['password'];

    $stmt = $conn->prepare("SELECT id, password FROM user WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    // Verificar el user y la contraseña
    if ($user && password_verify($password, $user['password'])) {
        // crear token
        $token = uniqid('token_');
        
        // guardar token en la base de datos
        $update = $conn->prepare("UPDATE user SET api_token = ? WHERE id = ?");
        $update->bind_param("si", $token, $user['id']);
        $update->execute();

        echo json_encode(['token' => $token, 'message' => 'Login correcto']);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Usuario o contraseña incorrectos']);
    }
}
?>