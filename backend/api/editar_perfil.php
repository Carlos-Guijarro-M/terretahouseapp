<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once '../includes/db.php';

$id = $_POST['id'] ?? '';
$nombre = $_POST['nombre'] ?? '';
$email = $_POST['email'] ?? '';
$passwordActual = $_POST['password_actual'] ?? '';
$passwordNueva = $_POST['password_nueva'] ?? '';

$stmt = $conn->prepare("SELECT password, foto FROM user WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$user_db = $stmt->get_result()->fetch_assoc();

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

    if ($user_db['foto'] && file_exists($carpeta . $user_db['foto'])) {
        unlink($carpeta . $user_db['foto']);
    }

    $nombreArchivo = time() . '_' . preg_replace('/\s+/', '', basename($_FILES['foto']['name']));
    $destino = $carpeta . $nombreArchivo; 

    if (move_uploaded_file($_FILES['foto']['tmp_name'], $destino)) {
        $fotoRuta = $nombreArchivo;
    }
}

//UPDATE del perfil
$campos = ["nombre = ?", "email = ?"];
$valores = [$nombre, $email];
$tipos = "ss";

if (!empty($passwordNueva)) {
    $campos[] = "password = ?";
    $valores[] = password_hash($passwordNueva, PASSWORD_DEFAULT);
    $tipos .= "s";
}

if ($fotoRuta) {
    $campos[] = "foto = ?";
    $valores[] = $fotoRuta;
    $tipos .= "s";
}

$valores[] = $id;
$tipos .= "i";

//Implode para concatenar los campos del array en una cadena separada por comas para construir la consulta SQL.
$sql = "UPDATE user SET " . implode(", ", $campos) . " WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param($tipos, ...$valores);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Perfil actualizado", "foto" => $fotoRuta]);
} else {
    echo json_encode(["status" => "error", "message" => "Error al actualizar"]);
}
?>