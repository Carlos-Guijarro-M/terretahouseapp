CREATE DATABASE IF NOT EXISTS terretahousebbdd;
USE terretahousebbdd;

CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(180) NOT NULL UNIQUE,
    nombre VARCHAR(100),
    apellidos VARCHAR(150),
    password VARCHAR(255) NOT NULL,
    foto VARCHAR(255) DEFAULT NULL,
    api_token VARCHAR(255) DEFAULT NULL,
    baneado TINYINT(1) DEFAULT 0,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expira DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actividad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL,
    estado VARCHAR(50) NOT NULL,
    provincia VARCHAR(100) NOT NULL,
    imagen_url VARCHAR(255),
    plazas_totales INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reserva (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL,
    estado VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    actividad_id INT NOT NULL,
    CONSTRAINT fk_reserva_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT fk_reserva_actividad FOREIGN KEY (actividad_id) REFERENCES actividad(id) ON DELETE CASCADE
);