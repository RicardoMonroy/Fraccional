# Configuración de Supabase para Fraccional - Fase 2

## 📋 Resumen
Este documento contiene las instrucciones necesarias para configurar Supabase CLI y ejecutar las migraciones de la base de datos para continuar con la **Fase 2** del proyecto Fraccional.

## 🔧 Configuración de Supabase CLI

### Opción 1: Instalación con npx (Recomendada)
Usar npx para ejecutar supabase-cli sin instalación global:

```bash
# Verificar que funciona
npx supabase --version

# Inicializar proyecto (ya configurado)
npx supabase init

# Iniciar servicios locales (opcional)
npx supabase start
```

### Opción 2: Instalación Local
Si prefieres instalar localmente como dependencia de desarrollo:

```bash
# Instalar como dependencia de desarrollo
npm install @supabase/cli --save-dev

# Usar desde node_modules
./node_modules/.bin/supabase --version
```

### Opción 3: Instalación Manual
Descargar e instalar binario directamente:

```bash
# Descargar binario
wget https://github.com/supabase/cli/releases/latest/download/supabase_linux_amd64.tar.gz

# Extraer
tar -xzf supabase_linux_amd64.tar.gz

# Mover a PATH local
sudo mv supabase /usr/local/bin/

# Verificar
supabase --version
```

## 🔑 Configuración de Autenticación

### 1. Login a Supabase
```bash
# Autenticar con tu cuenta de Supabase
npx supabase login

# O usar el binario si lo instalaste manualmente
supabase login
```

### 2. Vincular Proyecto Remoto
```bash
# Vincular con tu proyecto de Supabase existente
npx supabase link --project-ref hxmewkhzaavgltsvsvex

# Verificar vínculo
npx supabase status
```

## 🚀 Ejecución de Migraciones

### Migraciones Disponibles
En tu proyecto tienes las siguientes migraciones:

1. **003_auth_users_sync.sql** - Sincronización automática de usuarios
2. **004_default_admin_condominio_role.sql** - Rol inicial para administradores

### Ejecutar Migraciones
```bash
# Aplicar todas las migraciones pendientes
npx supabase db push

# O aplicar migraciones específicas
npx supabase migration up

# Verificar estado de la base de datos
npx supabase db status
```

## 📊 Verificación de Configuración

### 1. Verificar Conexión
```bash
# Probar conexión a la base de datos
npx supabase db ping

# Ver estructura de la base de datos
npx supabase db diff --schema public
```

### 2. Verificar Tablas Principales
Después de aplicar las migraciones, verifica que existan:

```sql
-- Conectar a la base de datos y ejecutar:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'usuarios',
  'roles', 
  'usuarios_roles_fraccionamiento',
  'fraccionamientos',
  'casas'
);
```

### 3. Verificar Triggers
```sql
-- Verificar triggers de sincronización
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
   OR trigger_schema = 'public';
```

## 🔄 Flujo de Trabajo para Desarrollador

### Para que yo pueda continuar con las siguientes fases:

1. **Tú debes ejecutar:**
   ```bash
   # Autenticar
   npx supabase login
   
   # Vincular proyecto
   npx supabase link --project-ref hxmewkhzaavgltsvsvex
   
   # Aplicar migraciones
   npx supabase db push
   ```

2. **Yo podré ejecutar:**
   - Generar y aplicar nuevas migraciones
   - Ejecutar seeders para datos iniciales
   - Gestionar el esquema de la base de datos
   - Continuar con la Fase 2 (Onboarding de AC)

## 🛠️ Comandos Útiles

### Gestión de Migraciones
```bash
# Crear nueva migración
npx supabase migration new nombre_migracion

# Aplicar migración específica
npx supabase migration up --to nombre_migracion

# Resetear base de datos (¡CUIDADO!)
npx supabase db reset
```

### Gestión del Proyecto
```bash
# Ver estado general
npx supabase status

# Ver logs
npx supabase logs

# Abrir Studio (dashboard web)
npx supabase studio
```

## 📝 Variables de Entorno

Tu `.env.local` ya está configurado correctamente:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hxmewkhzaavgltsvsvex.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bWV3a2h6YWF2Z2x0c3ZzdmV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTAwNjMsImV4cCI6MjA4MTIyNjA2M30.c_YAPi8k-eOVCZfw6h2HMUv9aejL9MbQtUpZWcXeLFU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4bWV3a2h6YWF2Z2x0c3ZzdmV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTY1MDA2MywiZXhwIjoyMDgxMjI2MDYzfQ.S-alP28bFHjn2Vg35Pna1DnS7W3iYdQu83oRYH5VPZs
```

## ✅ Checklist de Configuración

- [ ] Supabase CLI instalado (via npx)
- [ ] Autenticado en Supabase (`npx supabase login`)
- [ ] Proyecto vinculado (`npx supabase link`)
- [ ] Migraciones aplicadas (`npx supabase db push`)
- [ ] Verificar tablas creadas
- [ ] Verificar triggers activos

## 🚀 Próximos Pasos

Una vez completada esta configuración, podré:

1. **Generar el esquema completo** de la base de datos
2. **Crear migraciones adicionales** necesarias para la Fase 2
3. **Implementar el flujo de onboarding** para ADMIN_CONDOMINIO
4. **Configurar Prisma ORM** para el acceso a datos
5. **Desarrollar la landing page** funcional

---

**Nota**: Si encuentras algún problema durante la configuración, los comandos `npx supabase status` y `npx supabase logs` te ayudarán a diagnosticar cualquier issue.