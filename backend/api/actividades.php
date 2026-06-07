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
    $result = $conn->query("
        SELECT a.id, a.titulo, DATE(a.fecha) as fecha, a.estado, a.provincia, a.imagen_url, a.plazas_totales,
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
        if (file_exists($ruta)) {
            unlink($ruta);
        }
    }
}

if ($method === 'POST') {
    $titulo = $_POST['titulo'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $estado = 'disponible';
    $provincia = $_POST['provincia'] ?? '';
    $plazas_totales = $_POST['plazas_totales'] ?? 0;

    $imagenNombre = subirImagen();
    $imagen_url = $imagenNombre ? 'http://localhost:8000/uploads/actividades/' . $imagenNombre : null;

    $stmt = $conn->prepare("INSERT INTO actividad (titulo, fecha, estado, provincia, imagen_url, plazas_totales) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssi", $titulo, $fecha, $estado, $provincia, $imagen_url, $plazas_totales);

    header("Content-Type: application/json");
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad creada correctamente']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error: ' . $stmt->error]);
    }
    exit;
}

if ($method === 'PUT') {
    if (!isset($_GET['id'])) {
        http_response_code(400);
        header("Content-Type: application/json");
        echo json_encode(['message' => 'Falta el ID']);
        exit;
    }

    $id = $_GET['id'];
    $titulo = $_POST['titulo'] ?? '';
    $fecha = $_POST['fecha'] ?? '';
    $estado = $_POST['estado'] ?? '';
    $provincia = $_POST['provincia'] ?? '';
    $plazas_totales = $_POST['plazas_totales'] ?? 0;

    $stmt_img = $conn->prepare("SELECT imagen_url FROM actividad WHERE id = ?");
    $stmt_img->bind_param("i", $id);
    $stmt_img->execute();
    $act = $stmt_img->get_result()->fetch_assoc();
    $imagenActual = $act ? basename($act['imagen_url']) : null;

    $imagenNombre = subirImagen();
    if ($imagenNombre) {
        borrarImagen($imagenActual);
        $imagen_url = 'http://localhost:8000/uploads/actividades/' . $imagenNombre;
    } else {
        $imagen_url = $act['imagen_url'];
    }

    $stmt = $conn->prepare("UPDATE actividad SET titulo = ?, fecha = ?, provincia = ?, imagen_url = ?, plazas_totales = ? WHERE id = ?");
    $stmt->bind_param("ssssii", $titulo, $fecha, $provincia, $imagen_url, $plazas_totales, $id);

    header("Content-Type: application/json");
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad actualizada']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Error: ' . $stmt->error]);
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