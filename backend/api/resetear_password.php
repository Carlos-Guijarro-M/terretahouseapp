<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$token = trim($data['token'] ?? '');
$passwordNueva = trim($data['password'] ?? '');

error_log("Token recibido: " . $token);
error_log('TOKEN longitud: ' . strlen($token));

if (empty($token) || empty($passwordNueva)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Faltan datos']);
    exit;
}

$stmt = $conn->prepare("SELECT id, reset_token_expira FROM user WHERE reset_token = ?");
$stmt->bind_param("s", $token);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    echo json_encode(['status' => 'error', 'message' => 'Token incorrecto']);
    exit;
}

if (strtotime($user['reset_token_expira']) < time()) {
    echo json_encode(['status' => 'error', 'message' => 'El token ha expirado, solicita uno nuevo']);
    exit;
}

$hash = password_hash($passwordNueva, PASSWORD_DEFAULT);

$update = $conn->prepare("UPDATE user SET password = ?, reset_token = NULL, reset_token_expira = NULL WHERE id = ?");
$update->bind_param("si", $hash, $user['id']);
$update->execute();

echo json_encode(['status' => 'success', 'message' => 'Contraseña cambiada correctamente']);
?>