<?php
require_once '../includes/db.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

//Obtener datos del angular
$json = file_get_contents('php://input');
$data = json_decode($json, true);

$action = isset($_GET['action']) ? $_GET['action'] : '';

//Registro de usuario
if ($action === 'register') {
    $email = $data['email'];
    $password = password_hash($data['password'], PASSWORD_BCRYPT);

    //Insertamos el usuario en la tabla 'user'
    $stmt = $conn->prepare("INSERT INTO user (email, password) VALUES (?, ?)");
    $stmt->bind_param("ss", $email, $password);

    if ($stmt->execute()) {
        $userId = $stmt->insert_id;

        //Asignar el rol ( ROLE_ADMIN = id 1, ROLE_USER = id 2)
        $roleId = ($email === 'admin@gmail.com') ? 1 : 2;

        $stmtRol = $conn->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
        $stmtRol->bind_param("ii", $userId, $roleId);
        $stmtRol->execute();
    
        echo json_encode(['message' => 'Usuario registrado correctamente']);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Error al registrar el usuario']);
    }
}

//Login de usuario
elseif ($action === 'login') {
    $email = $data['email'];
    $password = $data['password'];

    //Buscar al usuario por su email
    $stmt = $conn->prepare("SELECT id, password FROM user WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if ($user && password_verify($password, $user['password'])) {
        
        //Generar token
        $token = bin2hex(random_bytes(32));
        
        //Guardarlo en la bbdd
        $update = $conn->prepare("UPDATE user SET api_token = ? WHERE id = ?");
        $update->bind_param("si", $token, $user['id']);
        $update->execute();

        echo json_encode([
            'token' => $token, 
            'message' => 'Login correcto'
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Usuario o contraseña incorrectos']);
    }
}
?>