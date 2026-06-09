<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../includes/db.php';
require_once 'auth_check.php';

if (!in_array('ROLE_ADMIN', $userRoles)) {
    http_response_code(403);
    header("Content-Type: application/json");
    echo json_encode(['message' => 'Acceso denegado']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    header("Content-Type: application/json");

    if (isset($_GET['user_id'])) {
        $user_id = $_GET['user_id'];
        $stmt = $conn->prepare("
            SELECT r.id, r.titulo, DATE_FORMAT(r.fecha, '%d/%m/%Y') as fecha, a.provincia, a.imagen_url,
            a.fecha_actividad, a.hora_inicio
            FROM reserva r
            JOIN actividad a ON r.actividad_id = a.id
            WHERE r.user_id = ?
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
        exit;
    }

    $result = $conn->query("
        SELECT u.id, u.nombre, u.apellidos, u.email, u.foto, u.baneado,
               GROUP_CONCAT(r.nombre) as roles
        FROM user u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        GROUP BY u.id
    ");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = $data['id'] ?? null;
    $baneado = $data['baneado'] ?? null;

    if (!$id || !isset($baneado)) {
        http_response_code(400);
        header("Content-Type: application/json");
        echo json_encode(['message' => 'Faltan datos']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE user SET baneado = ? WHERE id = ?");
    $stmt->bind_param("ii", $baneado, $id);

    header("Content-Type: application/json");
    if ($stmt->execute()) {
        $mensaje = $baneado == 1 ? 'Usuario baneado' : 'Usuario desbaneado';
        echo json_encode(['message' => $mensaje]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al actualizar el usuario']);
    }
    exit;
}

if ($method === 'DELETE' && isset($_GET['reserva_id'])) {
    $reserva_id = $_GET['reserva_id'];
    $stmt = $conn->prepare("DELETE FROM reserva WHERE id = ?");
    $stmt->bind_param("i", $reserva_id);
    header("Content-Type: application/json");
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Reserva eliminada']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al eliminar la reserva']);
    }
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        header("Content-Type: application/json");
        echo json_encode(['message' => 'Falta el ID']);
        exit;
    }

    $stmt_foto = $conn->prepare("SELECT foto FROM user WHERE id = ?");
    $stmt_foto->bind_param("i", $id);
    $stmt_foto->execute();
    $user = $stmt_foto->get_result()->fetch_assoc();
    if ($user && !empty($user['foto'])) {
        $rutaFoto = __DIR__ . '/../uploads/perfiles/' . $user['foto'];
        if (file_exists($rutaFoto)) {
            unlink($rutaFoto);
        }
    }

    $stmt = $conn->prepare("DELETE FROM user WHERE id = ?");
    $stmt->bind_param("i", $id);

    header("Content-Type: application/json");
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Usuario eliminado']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error al eliminar el usuario']);
    }
    exit;
}
?>