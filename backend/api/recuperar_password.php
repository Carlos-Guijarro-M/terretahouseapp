<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Falta el email']);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM user WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

if (!$user) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'No existe ninguna cuenta con ese email']);
    exit;
}

$token = bin2hex(random_bytes(16));
$expira = date('Y-m-d H:i:s', strtotime('+30 minutes'));

$update = $conn->prepare("UPDATE user SET reset_token = ?, reset_token_expira = ? WHERE id = ?");
$update->bind_param("ssi", $token, $expira, $user['id']);
$update->execute();

echo json_encode([
    'status' => 'success',
    'message' => 'Token generado correctamente',
    'token' => $token,
    'expira' => $expira
]);
?>