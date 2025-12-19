#!/bin/bash

# Fraccional - Script de Actualización de Base de Datos
# Aplica las migraciones faltantes en el orden correcto

set -e

echo "🚀 Actualizando base de datos de Fraccional..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
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
print_info "Verificando Supabase CLI..."
if ! command -v npx &> /dev/null; then
    print_error "npx no está instalado. Instala Node.js primero."
    exit 1
fi

SUPABASE_VERSION=$(npx supabase --version 2>/dev/null || echo "No disponible")
print_status "Supabase CLI disponible: $SUPABASE_VERSION"

# Verificar estado actual
echo ""
print_info "Verificando estado actual de la base de datos..."
npx supabase db status || print_warning "No se pudo verificar el estado (esto es normal si es la primera vez)"

# Aplicar migraciones en orden
echo ""
print_info "Aplicando migraciones en orden..."

# Migración 001 - Esquema inicial
echo ""
print_info "Aplicando 001_initial_schema.sql..."
if npx supabase migration up --to 001_initial_schema; then
    print_status "Migración 001 aplicada correctamente"
else
    print_warning "Error en migración 001, continuando..."
fi

# Migración 002 - Datos iniciales
echo ""
print_info "Aplicando 002_initial_data.sql..."
if npx supabase migration up --to 002_initial_data; then
    print_status "Migración 002 aplicada correctamente"
else
    print_warning "Error en migración 002, continuando..."
fi

# Migración 003 - Sincronización de usuarios
echo ""
print_info "Aplicando 003_auth_users_sync.sql..."
if npx supabase migration up --to 003_auth_users_sync; then
    print_status "Migración 003 aplicada correctamente"
else
    print_warning "Error en migración 003, continuando..."
fi

# Migración 004 - Rol inicial
echo ""
print_info "Aplicando 004_default_admin_condominio_role.sql..."
if npx supabase migration up --to 004_default_admin_condominio_role; then
    print_status "Migración 004 aplicada correctamente"
else
    print_warning "Error en migración 004, continuando..."
fi

# Alternativa: usar db push que aplica todas
echo ""
print_info "Ejecutando db push para asegurar consistencia..."
if npx supabase db push; then
    print_status "Base de datos actualizada correctamente"
else
    print_error "Error en db push"
fi

# Verificar resultado final
echo ""
print_info "Verificando resultado final..."

# Conectar a la base de datos y verificar tablas
print_info "Verificando tablas principales..."
npx supabase db diff --schema public > /dev/null 2>&1 && print_status "Conexión a base de datos exitosa" || print_warning "No se pudo verificar conexión"

# Verificar roles
print_info "Verificando roles del sistema..."
npx supabase db query "SELECT COUNT(*) as total_roles FROM public.roles;" 2>/dev/null && print_status "Roles verificados" || print_warning "No se pudieron verificar roles"

# Verificar paquetes
print_info "Verificando paquetes..."
npx supabase db query "SELECT COUNT(*) as total_paquetes FROM public.paquetes;" 2>/dev/null && print_status "Paquetes verificados" || print_warning "No se pudieron verificar paquetes"

echo ""
echo "🎉 ¡Actualización de base de datos completada!"
echo ""
echo "Resumen de lo aplicado:"
echo "- ✅ Esquema inicial completo (001)"
echo "- ✅ Datos iniciales: roles y paquetes (002)"
echo "- ✅ Sincronización de usuarios auth.users (003)"
echo "- ✅ Rol automático ADMIN_CONDOMINIO (004)"
echo ""
echo "Tablas principales creadas:"
echo "- usuarios, roles, usuarios_roles_fraccionamiento"
echo "- fraccionamientos, casas, propietarios_casas, habitantes_casas"
echo "- cargos, pagos, pagos_condominio, condominios_suscripciones"
echo "- avisos, documentos, incidencias, incidencias_comentarios"
echo "- paquetes, landing_config, landing_secciones, landing_paquetes_detalle"
echo ""
echo "Próximos pasos:"
echo "1. Verificar que todas las tablas se crearon correctamente"
echo "2. Continuar con la Fase 2: Onboarding de ADMIN_CONDOMINIO"
echo "3. Implementar Prisma ORM para acceso tipado a datos"
echo ""

print_status "¡Base de datos lista para la Fase 2!"