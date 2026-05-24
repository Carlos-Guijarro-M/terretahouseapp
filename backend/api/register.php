<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Faltan datos obligatorios']);
    exit;
}

$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

if ($email === 'admin@gmail.com') {
    $rol_final = json_encode(['ROLE_USER', 'ROLE_ADMIN']);
} else {
    $rol_final = json_encode(['ROLE_USER']);
}

$stmt = $conn->prepare("INSERT INTO user (email, password, roles) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $email, $password, $rol_final);

if ($stmt->execute()) {
    echo json_encode(['message' => 'Usuario registrado con éxito']);
} else {
    http_response_code(400);
    echo json_encode(['message' => 'Error al guardar el usuario']);
}
?>