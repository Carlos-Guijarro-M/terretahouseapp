<?php
$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    http_response_code(401);
    echo json_encode(['message' => 'Falta el token']);
    exit;
}

$token = str_replace('Bearer ', '', $headers['Authorization']);

$consulta = $conn->prepare("
    SELECT u.id, u.baneado, u.token_expira, GROUP_CONCAT(r.nombre) as roles 
    FROM user u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.api_token = ?
    GROUP BY u.id");
$consulta->bind_param("s", $token);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();

if (!$usuario) {
    http_response_code(401);
    echo json_encode(['message' => 'Token incorrecto']);
    exit;
}

if ($usuario['baneado']) {
    http_response_code(403);
    echo json_encode(['message' => 'Usuario baneado']);
    exit;
}

if ($usuario['token_expira'] && strtotime($usuario['token_expira']) < time()) {
    $limpiar = $conn->prepare("UPDATE user SET api_token = NULL, token_expira = NULL WHERE id = ?");
    $limpiar->bind_param("i", $usuario['id']);
    $limpiar->execute();
    http_response_code(401);
    echo json_encode(['message' => 'Sesión expirada']);
    exit;
}

$userId = $usuario['id'];
$userRoles = explode(',', $usuario['roles']);
?>