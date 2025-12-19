#!/bin/bash

# Fraccional - Script de Inicialización de Supabase
# Este script automatiza la configuración inicial de Supabase para el proyecto

set -e

echo "🚀 Iniciando configuración de Supabase para Fraccional..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir con color
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

print_status "Directorio del proyecto verificado"

# Verificar que .env.local existe
if [ ! -f ".env.local" ]; then
    print_error "No se encontró .env.local. Cópialo desde .env.example y configura las credenciales."
    exit 1
fi

print_status "Archivo .env.local encontrado"

# Verificar Supabase CLI
echo "🔍 Verificando Supabase CLI..."
if ! command -v npx &> /dev/null; then
    print_error "npx no está instalado. Instala Node.js primero."
    exit 1
fi

# Verificar que Supabase CLI funciona
if ! npx supabase --version &> /dev/null; then
    print_warning "Supabase CLI no está disponible. Se intentará usar npx."
fi

SUPABASE_VERSION=$(npx supabase --version 2>/dev/null || echo "No disponible")
print_status "Supabase CLI disponible: $SUPABASE_VERSION"

# Autenticación
echo ""
echo "🔐 Configurando autenticación..."
read -p "¿Ya estás autenticado en Supabase? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Por favor ejecuta: npx supabase login"
    echo "Luego ejecuta este script nuevamente."
    exit 1
fi

print_status "Autenticación verificada"

# Vincular proyecto
echo ""
echo "🔗 Vinculando proyecto remoto..."
if npx supabase link --project-ref hxmewkhzaavgltsvsvex; then
    print_status "Proyecto vinculado correctamente"
else
    print_error "Error al vincular el proyecto. Verifica tu autenticación y permisos."
    exit 1
fi

# Aplicar migraciones
echo ""
echo "📊 Aplicando migraciones..."
if npm run supabase:push; then
    print_status "Migraciones aplicadas correctamente"
else
    print_error "Error al aplicar migraciones"
    exit 1
fi

# Verificar estado
echo ""
echo "🔍 Verificando estado de la base de datos..."
if npm run supabase:status; then
    print_status "Estado de la base de datos verificado"
else
    print_warning "No se pudo verificar el estado. Revisa manualmente con: npx supabase status"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "Próximos pasos:"
echo "1. Verificar que las tablas se crearon correctamente"
echo "2. Revisar los logs si hay algún error"
echo "3. Continuar con la Fase 2 del desarrollo"
echo ""
echo "Comandos útiles:"
echo "- npm run supabase:status  # Ver estado"
echo "- npm run supabase:studio  # Abrir dashboard web"
echo "- npx supabase db reset    # Resetear BD (¡CUIDADO!)"
echo ""

print_status "¡Listo para continuar con la Fase 2!"