<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';
require_once 'auth_check.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $conn->prepare("SELECT r.*, a.provincia, a.imagen_url, a.plazas_totales, (SELECT COUNT(*) FROM reserva WHERE actividad_id = a.id) as plazas_ocupadas FROM reserva r JOIN actividad a ON r.actividad_id = a.id WHERE r.user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    echo json_encode($result);
}

elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $check = $conn->prepare("SELECT id FROM reserva WHERE user_id = ? AND actividad_id = ?");
    $check->bind_param("ii", $userId, $data['actividadId']);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['message' => 'Ya has reservado esta actividad']);
        exit;
    }

    $plazas = $conn->prepare("SELECT plazas_totales, (SELECT COUNT(*) FROM reserva WHERE actividad_id = ?) as ocupadas FROM actividad WHERE id = ?");
    $plazas->bind_param("ii", $data['actividadId'], $data['actividadId']);
    $plazas->execute();
    $info = $plazas->get_result()->fetch_assoc();

    if ($info && $info['ocupadas'] >= $info['plazas_totales']) {
        http_response_code(400);
        echo json_encode(['message' => 'No quedan plazas disponibles para esta actividad']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO reserva (titulo, user_id, actividad_id, estado, fecha) VALUES (?, ?, ?, 'pendiente', ?)");
    $stmt->bind_param("siis", $data['titulo'], $userId, $data['actividadId'], $data['fecha']);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Reserva creada con éxito']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al guardar la reserva']);
    }
}

elseif ($method === 'PUT') {
    $id = $_GET['id'];
    $data = json_decode(file_get_contents('php://input'), true);

    $stmt = $conn->prepare("UPDATE reserva SET titulo = ?, fecha = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ssii", $data['titulo'], $data['fecha'], $id, $userId);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Reserva actualizada']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al actualizar']);
    }
}

elseif ($method === 'DELETE') {
    $id = $_GET['id'];

    $stmt = $conn->prepare("DELETE FROM reserva WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $userId);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'Reserva eliminada']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al eliminar']);
    }
}
?>