<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
    $method = 'PUT';
}

if ($method === 'GET') {
    header("Content-Type: application/json");

    if (isset($_GET['actividad_id'])) {
        $actividad_id = $_GET['actividad_id'];
        $stmt = $conn->prepare("
            SELECT u.id, u.nombre, u.apellidos, u.email, r.id as reserva_id,
                   DATE_FORMAT(r.fecha_reserva, '%d/%m/%Y') as fecha
            FROM reserva r
            JOIN user u ON r.user_id = u.id
            WHERE r.actividad_id = ?
        ");
        $stmt->bind_param("i", $actividad_id);
        $stmt->execute();
        echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
        exit;
    }

    $result = $conn->query("
        SELECT a.id, a.titulo, a.descripcion, DATE_FORMAT(a.fecha_actividad, '%d/%m/%Y') as fecha, 
               a.hora_inicio, a.hora_fin, a.provincia, a.imagen_url, a.plazas_totales, a.mapa_iframe,
               COUNT(r.id) as plazas_ocupadas
        FROM actividad a
        LEFT JOIN reserva r ON a.id = r.actividad_id
        GROUP BY a.id
    ");
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    exit;
}

require_once 'auth_check.php';

if (!in_array('ROLE_ADMIN', $userRoles)) {
    http_response_code(403);
    header("Content-Type: application/json");
    echo json_encode(['message' => 'Acceso denegado']);
    exit;
}

function subirImagen() {
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $carpeta = __DIR__ . '/../uploads/actividades/';
        if (!is_dir($carpeta)) {
             mkdir($carpeta, 0755, true); 
            }
        $nombreArchivo = time() . '_' . preg_replace('/\s+/', '', basename($_FILES['imagen']['name']));
        $destino = $carpeta . $nombreArchivo;
        if (move_uploaded_file($_FILES['imagen']['tmp_name'], $destino)) { 
            return $nombreArchivo; 
        }
    }
    return null;
}

function borrarImagen($nombreArchivo) {
    if (!empty($nombreArchivo)) {
        $ruta = __DIR__ . '/../uploads/actividades/' . $nombreArchivo;
        if (file_exists($ruta)) { unlink($ruta); }
    }
}

if ($method === 'POST') {
    $titulo = $_POST['titulo'] ?? '';
    $desc = $_POST['descripcion'] ?? '';
    $fecha = $_POST['fecha_actividad'] ?? '';
    $h_ini = $_POST['hora_inicio'] ?? '';
    $h_fin = $_POST['hora_fin'] ?? '';
    $prov = $_POST['provincia'] ?? '';
    $plazas = $_POST['plazas_totales'] ?? 0;
    $mapa = $_POST['mapa_iframe'] ?? '';

    $imagenNombre = subirImagen();
    $imagen_url = $imagenNombre ? 'http://localhost:8000/uploads/actividades/' . $imagenNombre : null;

    $stmt = $conn->prepare("INSERT INTO actividad (titulo, descripcion, fecha_actividad, hora_inicio, hora_fin, provincia, imagen_url, plazas_totales, mapa_iframe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssis", $titulo, $desc, $fecha, $h_ini, $h_fin, $prov, $imagen_url, $plazas, $mapa);

    header("Content-Type: application/json");
    echo json_encode(['message' => $stmt->execute() ? 'Actividad creada' : 'Error: ' . $stmt->error]);
    exit;
}

if ($method === 'PUT') {
    $id = $_GET['id'] ?? null;
    if (!$id) { http_response_code(400); exit; }

    $titulo = $_POST['titulo'] ?? '';
    $desc = $_POST['descripcion'] ?? '';
    $fecha = $_POST['fecha_actividad'] ?? '';
    $h_ini = $_POST['hora_inicio'] ?? '';
    $h_fin = $_POST['hora_fin'] ?? '';
    $prov = $_POST['provincia'] ?? '';
    $plazas = $_POST['plazas_totales'] ?? 0;
    $mapa = $_POST['mapa_iframe'] ?? '';

    $stmt_img = $conn->prepare("SELECT imagen_url FROM actividad WHERE id = ?");
    $stmt_img->bind_param("i", $id);
    $stmt_img->execute();
    $act = $stmt_img->get_result()->fetch_assoc();
    $imagenNombre = subirImagen();
    $imagen_url = $imagenNombre ? 'http://localhost:8000/uploads/actividades/' . $imagenNombre : ($act['imagen_url'] ?? null);
    if ($imagenNombre) borrarImagen(basename($act['imagen_url'] ?? ''));

    $stmt = $conn->prepare("UPDATE actividad SET titulo = ?, descripcion = ?, fecha_actividad = ?, hora_inicio = ?, hora_fin = ?, provincia = ?, imagen_url = ?, plazas_totales = ?, mapa_iframe = ? WHERE id = ?");
    $stmt->bind_param("sssssssisi", $titulo, $desc, $fecha, $h_ini, $h_fin, $prov, $imagen_url, $plazas, $mapa, $id);

    header("Content-Type: application/json");
    echo json_encode(['message' => $stmt->execute() ? 'Actividad actualizada' : 'Error: ' . $stmt->error]);
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
    if (!isset($_GET['id'])) {
        http_response_code(400);
        header("Content-Type: application/json");
        echo json_encode(['message' => 'Falta el ID']);
        exit;
    }

    $id = $_GET['id'];

    $stmt_img = $conn->prepare("SELECT imagen_url FROM actividad WHERE id = ?");
    $stmt_img->bind_param("i", $id);
    $stmt_img->execute();
    $act = $stmt_img->get_result()->fetch_assoc();
    if ($act) {
        borrarImagen(basename($act['imagen_url']));
    }

    $stmt = $conn->prepare("DELETE FROM actividad WHERE id = ?");
    $stmt->bind_param("i", $id);

    header("Content-Type: application/json");
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad eliminada']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error: ' . $stmt->error]);
    }
    exit;
}
?>