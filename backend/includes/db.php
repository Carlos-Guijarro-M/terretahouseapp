<?php


$host = 'db';           
$username = 'root';     
$password = 'root'; 
$database = 'terretahousebbdd';

$conn = new mysqli($host, $username, $password, $database);

//Hora de Madrid(local)
date_default_timezone_set('Europe/Madrid');
$conn->query("SET time_zone = '+02:00'");

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>