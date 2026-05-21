<?php
require_once 'auth_check.php'; 
header("Content-Type: application/json");

$stmt = $conn->prepare("SELECT id, email, roles FROM user WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$user = $stmt->get_result()->fetch_assoc();

echo json_encode([
    'id' => $user['id'],
    'email' => $user['email'],
    'roles' => json_decode($user['roles'], true)
]);
?>