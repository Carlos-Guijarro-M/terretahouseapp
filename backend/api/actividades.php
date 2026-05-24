<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Obtener actividades
if ($method === 'GET') {
    $result = $conn->query("SELECT id, titulo, DATE(fecha) as fecha, estado FROM actividad");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    exit;
}

require_once 'auth_check.php';

if (!in_array('ROLE_ADMIN', $userRoles)) {
    http_response_code(403);
    echo json_encode(['message' => 'Acceso denegado']);
    exit;
}

// añadir actividad
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    //guardar la fecha
    $stmt = $conn->prepare("INSERT INTO actividad (titulo, fecha, estado) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $data['titulo'], $data['fecha'], $data['estado']);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad creada correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al guardar en la base de datos']);
    }
}

// actualizar
if ($method === 'PUT') {
    $id = $_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $conn->prepare("UPDATE actividad SET titulo = ?, fecha = ?, estado = ? WHERE id = ?");
    $stmt->bind_param("sssi", $data['titulo'], $data['fecha'], $data['estado'], $id);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad actualizada']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al actualizar']);
    }
}

// borrar
if ($method === 'DELETE') {
    $id = $_GET['id'];
    $stmt = $conn->prepare("DELETE FROM actividad WHERE id = ?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad eliminada']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al borrar']);
    }
}
?>