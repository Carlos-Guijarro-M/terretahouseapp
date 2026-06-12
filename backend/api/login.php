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
$recaptchaToken = $data['recaptcha_token'] ?? '';

$secret = '6LcEpxMtAAAAAJbq5T6_waCOTsrXFYikAQLZUdV6';
$url = "https://www.google.com/recaptcha/api/siteverify?secret={$secret}&response={$recaptchaToken}";

$verify = file_get_contents($url);
$captchaResponse = json_decode($verify);

if (!$captchaResponse->success) {
    http_response_code(400);
    echo json_encode(['message' => 'Error de validación: Por favor, verifica el CAPTCHA.']);
    exit;
}

$stmt = $conn->prepare("SELECT u.*, GROUP_CONCAT(r.nombre) as roles FROM user u LEFT JOIN user_roles ur ON u.id = ur.user_id LEFT JOIN roles r ON ur.role_id = r.id WHERE u.email = ? GROUP BY u.id");
$stmt->bind_param("s", $email);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

//Verificar las credenciales
if ($user && password_verify($password, $user['password'])) {

    //comprobar ban
    if ($user['baneado'] == 1) {
        http_response_code(403);
        echo json_encode(['message' => 'Usuario baneado']);
        exit;
    }

    //generar token y expiracion
    $nuevoToken = bin2hex(random_bytes(32));
    $expira = date('Y-m-d H:i:s', strtotime('+2 hours'));
    
    $update = $conn->prepare("UPDATE user SET api_token = ?, token_expira = ? WHERE id = ?");
    $update->bind_param("ssi", $nuevoToken, $expira, $user['id']);
    $update->execute();

    echo json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'nombre' => $user['nombre'],
        'apellidos' => $user['apellidos'],
        'api_token' => $nuevoToken,
        'roles' => $user['roles'] ? explode(',', $user['roles']) : [],
        'foto' => $user['foto']
    ]);
} else {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciales incorrectas']);
}
?>