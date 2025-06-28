#!/bin/bash

# Mostrar versiones
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# Instalar dependencias
echo "Installing dependencies..."
npm ci

# Compilar el proyecto
echo "Building project..."
npm run build

# Verificar si la compilación fue exitosa
if [ $? -eq 0 ]; then
  echo "Build successful!"
  exit 0
else
  echo "Build failed!"
  exit 1
fi