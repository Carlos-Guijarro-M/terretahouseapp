<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require_once '../includes/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    if (isset($_POST['_method']) && $_POST['_method'] === 'PUT') {
        $method = 'PUT';
    }
}

//Metodo GET
if ($method === 'GET') {
    header("Content-Type: application/json");

    if (isset($_GET['actividad_id'])) {
        $actividad_id = $_GET['actividad_id'];
        $stmt = $conn->prepare("SELECT u.id, u.nombre, u.apellidos, u.email, r.id as reserva_id, DATE_FORMAT(r.fecha_reserva, '%d/%m/%Y') as fecha 
                                FROM reserva r 
                                JOIN user u ON r.user_id = u.id 
                                WHERE r.actividad_id = ?");
        $stmt->bind_param("i", $actividad_id);
        $stmt->execute();
        echo json_encode($stmt->get_result()->fetch_all(MYSQLI_ASSOC));
        exit;
    }

    $sql = "SELECT a.id, a.titulo, a.descripcion, DATE_FORMAT(a.fecha_actividad, '%d/%m/%Y') as fecha, 
                   a.hora_inicio, a.hora_fin, a.provincia, a.imagen_url, a.plazas_totales, a.mapa_iframe,
                   COUNT(r.id) as plazas_ocupadas
            FROM actividad a
            LEFT JOIN reserva r ON a.id = r.actividad_id
            GROUP BY a.id";
    $result = $conn->query($sql);
    echo json_encode($result->fetch_all(MYSQLI_ASSOC));
    exit;
}

//Solo admin pueden realizar acciones de escritura
require_once 'auth_check.php';

if (!in_array('ROLE_ADMIN', $userRoles)) {
    http_response_code(403);
    header("Content-Type: application/json");
    echo json_encode(['message' => 'Acceso denegado']);
    exit;
}

// Subir las imagenes desde la carpeta
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
    if ($nombreArchivo != null && $nombreArchivo != "") {
        $ruta = __DIR__ . '/../uploads/actividades/' . $nombreArchivo;
        if (file_exists($ruta)) {
            unlink($ruta);
        }
    }
}

//Metodo POST
if ($method === 'POST') {
    $titulo = $_POST['titulo'];
    $descripcion = $_POST['descripcion'];
    $fecha_actividad = $_POST['fecha_actividad'];
    $hora_inicio = $_POST['hora_inicio'];
    $hora_fin = $_POST['hora_fin'];
    $provincia = $_POST['provincia'];
    $plazas_totales = $_POST['plazas_totales'];
    $mapa_iframe = $_POST['mapa_iframe'];

    $imagenNombre = subirImagen();
    $imagen_url = null;
    if ($imagenNombre != null) {
        $imagen_url = 'http://localhost:8000/uploads/actividades/' . $imagenNombre;
    }

    $stmt = $conn->prepare("INSERT INTO actividad (titulo, descripcion, fecha_actividad, hora_inicio, hora_fin, provincia, imagen_url, plazas_totales, mapa_iframe) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssssssis", $titulo, $descripcion, $fecha_actividad, $hora_inicio, $hora_fin, $provincia, $imagen_url, $plazas_totales, $mapa_iframe);

    header("Content-Type: application/json");
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad creada']);
    } else {
        echo json_encode(['message' => 'Error: ' . $stmt->error]);
    }
    exit;
}

//Metodo PUT
if ($method === 'PUT') {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    if ($id == null) {
        http_response_code(400);
        exit;
    }

    $titulo = $_POST['titulo'];
    $descripcion = $_POST['descripcion'];
    $fecha_actividad = $_POST['fecha_actividad'];
    $hora_inicio = $_POST['hora_inicio'];
    $hora_fin = $_POST['hora_fin'];
    $provincia = $_POST['provincia'];
    $plazas_totales = $_POST['plazas_totales'];
    $mapa_iframe = $_POST['mapa_iframe'];

    $stmt_img = $conn->prepare("SELECT imagen_url FROM actividad WHERE id = ?");
    $stmt_img->bind_param("i", $id);
    $stmt_img->execute();
    $act = $stmt_img->get_result()->fetch_assoc();

    $imagenNombre = subirImagen();
    $imagen_url = $act['imagen_url'];
    if ($imagenNombre != null) {
        $imagen_url = 'http://localhost:8000/uploads/actividades/' . $imagenNombre;
        borrarImagen(basename($act['imagen_url']));
    }

    $stmt = $conn->prepare("UPDATE actividad SET titulo = ?, descripcion = ?, fecha_actividad = ?, hora_inicio = ?, hora_fin = ?, provincia = ?, imagen_url = ?, plazas_totales = ?, mapa_iframe = ? WHERE id = ?");
    $stmt->bind_param("sssssssisi", $titulo, $descripcion, $fecha_actividad, $hora_inicio, $hora_fin, $provincia, $imagen_url, $plazas_totales, $mapa_iframe, $id);

    header("Content-Type: application/json");
    if ($stmt->execute()) {
        echo json_encode(['message' => 'Actividad actualizada']);
    } else {
        echo json_encode(['message' => 'Error: ' . $stmt->error]);
    }
    exit;
}

//Metodo DELETE
if ($method === 'DELETE') {
    header("Content-Type: application/json");

    // Borrar la reserva
    if (isset($_GET['reserva_id'])) {
        $stmt = $conn->prepare("DELETE FROM reserva WHERE id = ?");
        $stmt->bind_param("i", $_GET['reserva_id']);
        echo json_encode(['message' => $stmt->execute() ? 'Reserva eliminada' : 'Error al eliminar reserva']);
        exit;
    }

    // Borrar la actividad
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $stmt_img = $conn->prepare("SELECT imagen_url FROM actividad WHERE id = ?");
        $stmt_img->bind_param("i", $id);
        $stmt_img->execute();
        $act = $stmt_img->get_result()->fetch_assoc();
        
        if ($act != null) {
            borrarImagen(basename($act['imagen_url']));
        }

        $stmt = $conn->prepare("DELETE FROM actividad WHERE id = ?");
        $stmt->bind_param("i", $id);
        echo json_encode(['message' => $stmt->execute() ? 'Actividad eliminada' : 'Error al eliminar actividad']);
        exit;
    }
}
?>