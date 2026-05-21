FROM php:8.2-fpm

# Instalar dependencias necesarias para que Symfony y la base de datos funcionen
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql 

#extensión mysqli
RUN docker-php-ext-install mysqli && docker-php-ext-enable mysqli

# Instalar Composer (el gestor de dependencias de Symfony)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definir la carpeta de trabajo dentro del contenedor
WORKDIR /var/www/html