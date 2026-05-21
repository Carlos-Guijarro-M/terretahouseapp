<?php

require_once 'auth_check.php'; 
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: Listar actividades (Todos los logueados pueden ver) ---
if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM actividad");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
} 

// --- POST: Crear actividad (SOLO ADMIN) ---
elseif ($method === 'POST') {
    if (!in_array('ROLE_ADMIN', $userRoles)) {
        http_response_code(403);
        exit(json_encode(['message' => 'Acceso denegado']));
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $stmt = $conn->prepare("INSERT INTO actividad (nombre, descripcion, precio) VALUES (?, ?, ?)");
    $stmt->bind_param("ssd", $data['nombre'], $data['descripcion'], $data['precio']);
    $stmt->execute();
    echo json_encode(['message' => 'Actividad creada']);
}

// --- PUT: Modificar actividad (SOLO ADMIN) ---
elseif ($method === 'PUT') {
    if (!in_array('ROLE_ADMIN', $userRoles)) {
        http_response_code(403);
        exit(json_encode(['message' => 'Acceso denegado']));
    }

    $id = $_GET['id'] ?? 0;
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $conn->prepare("UPDATE actividad SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?");
    $stmt->bind_param("ssdi", $data['nombre'], $data['descripcion'], $data['precio'], $id);
    $stmt->execute();
    
    echo ($stmt->affected_rows > 0) ? json_encode(['message' => 'Actividad actualizada']) : http_response_code(404);
}

// --- DELETE: Borrar actividad (SOLO ADMIN) ---
elseif ($method === 'DELETE') {
    if (!in_array('ROLE_ADMIN', $userRoles)) {
        http_response_code(403);
        exit(json_encode(['message' => 'Acceso denegado']));
    }

    $id = $_GET['id'] ?? 0;
    $stmt = $conn->prepare("DELETE FROM actividad WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    
    echo ($stmt->affected_rows > 0) ? json_encode(['message' => 'Actividad eliminada']) : http_response_code(404);
}
?>