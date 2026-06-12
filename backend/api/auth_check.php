<?php

//Obtener cabeceras de la petición HTTP para recuperar los datos de control que envía el cliente en la petición HTTP.
$headers = getallheaders();

if (!isset($headers['Authorization'])) {
    http_response_code(401);
    header("Content-Type: application/json");
    echo json_encode(['message' => 'Falta el token de autorización']);
    exit;
}

//Extraer el token eliminando
$token = str_replace('Bearer ', '', $headers['Authorization']);

//Buscar al user en la BBDD
$consulta = $conn->prepare("SELECT id, baneado, token_expira FROM user WHERE api_token = ?");
$consulta->bind_param("s", $token);
$consulta->execute();
$usuario = $consulta->get_result()->fetch_assoc();

//Hacer la validacion del user, si no hay user - no hay validacion
if (!$usuario) {
    http_response_code(401);
    header("Content-Type: application/json");
    echo json_encode(['message' => 'Token incorrecto']);
    exit;
}

if ($usuario['baneado']) {
    http_response_code(403);
    header("Content-Type: application/json");
    echo json_encode(['message' => 'Usuario baneado']);
    exit;
}

if ($usuario['token_expira'] && strtotime($usuario['token_expira']) < time()) {
    $limpiar = $conn->prepare("UPDATE user SET api_token = NULL, token_expira = NULL WHERE id = ?");
    $limpiar->bind_param("i", $usuario['id']);
    $limpiar->execute();
    
    http_response_code(401);
    header("Content-Type: application/json");
    echo json_encode(['message' => 'Sesión expirada']);
    exit;
}

//Recuperar los roles
$consultaRoles = $conn->prepare("SELECT r.nombre FROM roles r JOIN user_roles ur ON r.id = ur.role_id WHERE ur.user_id = ?");
$consultaRoles->bind_param("i", $usuario['id']);
$consultaRoles->execute();
$resultado = $consultaRoles->get_result();

$userRoles = [];

while ($fila = $resultado->fetch_assoc()) {
    $userRoles[] = $fila['nombre'];
}

$userId = $usuario['id'];
?>