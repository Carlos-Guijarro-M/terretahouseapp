<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$id = $_POST['id'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$email = $_POST['email'] ?? '';
$passwordActual = $_POST['password_actual'] ?? '';
$passwordNueva = $_POST['password_nueva'] ?? '';

header("Content-Type: application/json");

$pswd_correct = $conn->prepare("SELECT password, foto FROM user WHERE id = ?");
$pswd_correct->bind_param("i", $id);
$pswd_correct->execute();
$user_db = $pswd_correct->get_result()->fetch_assoc();

if (!$user_db || !password_verify($passwordActual, $user_db['password'])) {
    echo json_encode(["status" => "error", "message" => "La contraseña actual no es correcta"]);
    exit();
}

$fotoRuta = null;
if (isset($_FILES['foto']) && $_FILES['foto']['error'] === UPLOAD_ERR_OK) {
    $carpeta = __DIR__ . '/../uploads/perfiles/';

    if (!is_dir($carpeta)) {
        mkdir($carpeta, 0755, true);
    }

    if (!empty($user_db['foto'])) {
        $fotoExistente = $carpeta . $user_db['foto'];
        if (file_exists($fotoExistente)) {
            unlink($fotoExistente);
        }
    }

    $nombreArchivo = time() . '_' . preg_replace('/\s+/', '', basename($_FILES['foto']['name']));
    $destino = $carpeta . $nombreArchivo;

    if (move_uploaded_file($_FILES['foto']['tmp_name'], $destino)) {
        $fotoRuta = $nombreArchivo;
    }
}

try {
    if (!empty($passwordNueva)) {
        if (password_verify($passwordNueva, $user_db['password'])) {
            echo json_encode(["status" => "error", "message" => "La nueva contraseña no puede ser igual a la actual"]);
            exit();
        }

        $hash = password_hash($passwordNueva, PASSWORD_DEFAULT);

        $sql = $fotoRuta ? "UPDATE user SET nombre=?, email=?, password=?, foto=? WHERE id=?"
                         : "UPDATE user SET nombre=?, email=?, password=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $fotoRuta ? $stmt->bind_param("ssssi", $nombre, $email, $hash, $fotoRuta, $id)
                  : $stmt->bind_param("sssi", $nombre, $email, $hash, $id);
    } else {
        $sql = $fotoRuta ? "UPDATE user SET nombre=?, email=?, foto=? WHERE id=?"
                         : "UPDATE user SET nombre=?, email=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $fotoRuta ? $stmt->bind_param("sssi", $nombre, $email, $fotoRuta, $id)
                  : $stmt->bind_param("ssi", $nombre, $email, $id);
    }

    if ($stmt->execute()) {
        $respuesta = ["status" => "success", "message" => "Perfil actualizado"];
        if ($fotoRuta) {
            $respuesta["foto"] = $fotoRuta;
        }
        echo json_encode($respuesta);
    } else {
        throw new Exception("Error al ejecutar la actualización en la BD");
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>