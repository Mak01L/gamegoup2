#!/bin/bash

# Crear directorio dist si no existe
mkdir -p dist

# Copiar archivos estáticos
cp -r public/* dist/

echo "Build completado con éxito"