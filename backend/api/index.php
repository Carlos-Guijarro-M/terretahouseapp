<?php
header("Content-Type: application/json");
echo json_encode([
    "message" => "Bienvenido a la API de TerretaHouse",
    "status" => "online"
]);
?>