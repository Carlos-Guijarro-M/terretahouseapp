<?php
$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['message' => 'Falta el token']);
    exit;
}

// quitar palabra bearer del token
$token = str_replace('Bearer ', '', $headers['Authorization']);

$consulta = $conn->prepare("SELECT id, roles FROM user WHERE api_token = ?");
$consulta->bind_param("s", $token);
$consulta->execute();
$resultado = $consulta->get_result();
$usuario = $resultado->fetch_assoc();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['message' => 'Token incorrecto']);
    exit;
}

$userId = $usuario['id'];
$userRoles = json_decode($usuario['roles'], true);
?>