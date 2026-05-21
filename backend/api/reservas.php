<?php
require_once 'auth_check.php'; // Protegemos el archivo
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

$method = $_SERVER['REQUEST_METHOD'];

// Manejo de preflight de CORS
if ($method === 'OPTIONS') exit;

// --- GET: Listar mis reservas ---
if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT * FROM reserva WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode($result);
}

// --- POST: Crear reserva ---
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $conn->prepare("INSERT INTO reserva (titulo, user_id, actividad_id, estado) VALUES (?, ?, ?, 'pendiente')");
    $stmt->bind_param("sii", $data['titulo'], $userId, $data['actividadId']);
    
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Reserva creada con éxito']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al crear la reserva']);
    }
}

// --- PUT: Actualizar reserva (ej: cambiar estado) ---
elseif ($method === 'PUT') {
    // Para PUT, el ID suele venir en la URL: api/reservas.php?id=5
    $id = $_GET['id'] ?? 0;
    $data = json_decode(file_get_contents('php://input'), true);
    
    $stmt = $conn->prepare("UPDATE reserva SET titulo = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sii", $data['titulo'], $id, $userId);
    $stmt->execute();
    
    echo json_encode(['message' => 'Reserva actualizada']);
}

// --- DELETE: Borrar reserva ---
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    
    $stmt = $conn->prepare("DELETE FROM reserva WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $userId);
    $stmt->execute();
    
    echo json_encode(['message' => 'Reserva eliminada']);
}
?>