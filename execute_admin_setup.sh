#!/bin/bash
# Script para ejecutar la configuración de admin general via CLI

echo "Configurando admin general en Supabase..."

# Verificar que estamos en el directorio correcto
if [ ! -f "setup_admin_general.sql" ]; then
    echo "Error: No se encontró setup_admin_general.sql"
    exit 1
fi

# Ejecutar el script SQL
npx supabase db execute --file setup_admin_general.sql

echo "Configuración completada!"