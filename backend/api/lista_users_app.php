<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once '../includes/db.php';

$query = "SELECT id, email, roles FROM user";
$result = $conn->query($query);

$users = [];

while ($row = $result->fetch_assoc()) {
    $row['roles'] = json_decode($row['roles'], true);
    
    $users[] = $row;
}

echo json_encode($users);
?>