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

$stmt = $conn->prepare("
    SELECT u.*, GROUP_CONCAT(r.nombre) as roles 
    FROM user u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.email = ?
    GROUP BY u.id");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {

    if ($user['baneado'] == 1) {
        http_response_code(403);
        echo json_encode(['message' => 'Usuario baneado']);
        exit;
    }

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
        'nombre' => $user['nombre'],
        'apellidos' => $user['apellidos'],
        'api_token' => $user['api_token'],
        'roles' => explode(',', $user['roles']),
        'foto' => $user['foto']
    ]);
} else {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciales incorrectas']);
}
?>