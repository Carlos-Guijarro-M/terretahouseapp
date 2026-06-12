<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$email = $_POST['email'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$apellidos = $_POST['apellidos'] ?? '';
$password = $_POST['password'] ?? '';
$recaptchaToken = $_POST['recaptcha_token'] ?? '';

$secret = '6LcEpxMtAAAAAJbq5T6_waCOTsrXFYikAQLZUdV6'; 
$url = "https://www.google.com/recaptcha/api/siteverify?secret={$secret}&response={$recaptchaToken}";

$verify = file_get_contents($url);
$captchaResponse = json_decode($verify);

if (!$captchaResponse->success) {
    http_response_code(400);
    echo json_encode(['message' => 'Error de validación del CAPTCHA.']);
    exit;
}

if (empty($email) || empty($password) || empty($nombre) || empty($apellidos)) {
    http_response_code(400);
    echo json_encode(['message' => 'Faltan datos obligatorios']);
    exit;
}

$checkStmt = $conn->prepare("SELECT id, baneado FROM user WHERE email = ?");
$checkStmt->bind_param("s", $email);
$checkStmt->execute();
$resultado = $checkStmt->get_result()->fetch_assoc();

if ($resultado) {
    if ($resultado['baneado'] == 1) {
        http_response_code(403);
        echo json_encode(['message' => 'Este correo electrónico está baneado.']);
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Este email ya está registrado.']);
    }
    exit;
}

$fotoRuta = null;
if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
    $carpeta = __DIR__ . '/../uploads/perfiles/';
    if (!is_dir($carpeta)) mkdir($carpeta, 0755, true);
    
    $nombreArchivo = time() . '_' . preg_replace('/\s+/', '', basename($_FILES['foto']['name']));
    if (move_uploaded_file($_FILES['foto']['tmp_name'], $carpeta . $nombreArchivo)) {
        $fotoRuta = $nombreArchivo;
    }
}

$hashPassword = password_hash($password, PASSWORD_DEFAULT);

$stmt = $conn->prepare("INSERT INTO user (email, nombre, apellidos, password, foto) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sssss", $email, $nombre, $apellidos, $hashPassword, $fotoRuta);

if ($stmt->execute()) {
    $userId = $conn->insert_id;

    //Asignar el rol ( ROLE_ADMIN = id 1, ROLE_USER = id 2)
    $rolId = ($email === 'admin@gmail.com') ? 1 : 2;
    
    $stmtRol = $conn->prepare("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)");
    $stmtRol->bind_param("ii", $userId, $rolId);
    
    if ($stmtRol->execute()) {
        echo json_encode(['message' => 'Usuario registrado con éxito']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Usuario creado, pero hubo un error asignando el rol']);
    }
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Error al registrar el usuario en la base de datos']);
}
?>