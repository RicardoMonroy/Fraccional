# Instrucciones para Corregir el Bug de ADMIN_GENERAL

## 🚨 Problema Identificado
- Usuario ADMIN_GENERAL era redirigido al onboarding en lugar del dashboard
- Falta protección de rutas basada en roles
- Roles de ADMIN_CONDOMINIO interfieren con ADMIN_GENERAL

## 📋 Pasos para Corregir

### **Paso 1: Limpiar Roles Incompatibles**
Ejecuta en Supabase SQL Editor:

```sql
-- Verificar roles actuales
SELECT 
    ur.id,
    r.nombre as rol_actual,
    r.nivel_permisos,
    ur.fraccionamiento_id,
    ur.acceso_habilitado,
    ur.fecha_asignacion
FROM public.usuarios_roles_fraccionamiento ur
JOIN public.roles r ON ur.rol_id = r.id
WHERE ur.usuario_id = '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4'
ORDER BY r.nivel_permisos DESC;

-- Eliminar roles de ADMIN_CONDOMINIO
DELETE FROM public.usuarios_roles_fraccionamiento 
WHERE usuario_id = '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4' 
AND rol_id = 3; -- ADMIN_CONDOMINIO

-- Eliminar roles de AUX_ADMIN_CONDOMINIO
DELETE FROM public.usuarios_roles_fraccionamiento 
WHERE usuario_id = '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4' 
AND rol_id = 4; -- AUX_ADMIN_CONDOMINIO

-- Verificar resultado final
SELECT 
    ur.id,
    r.nombre as rol_final,
    r.nivel_permisos,
    ur.fraccionamiento_id,
    ur.acceso_habilitado,
    ur.fecha_asignacion
FROM public.usuarios_roles_fraccionamiento ur
JOIN public.roles r ON ur.rol_id = r.id
WHERE ur.usuario_id = '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4'
ORDER BY r.nivel_permisos DESC;
```

### **Paso 2: Probar el Login**
1. Abre tu aplicación: `npm run dev`
2. Ve a http://localhost:3000/auth/login
3. Inicia sesión con tu cuenta
4. Deberías ser redirigido directamente al dashboard (no al onboarding)

### **Paso 3: Verificar Protección de Rutas**
- **Usuario NO autenticado** → /dashboard → redirige a /auth/login
- **Usuario ADMIN_GENERAL** → /auth/login → redirige a /dashboard
- **Usuario regular** → /auth/login → redirige a /onboarding

## 🔧 Archivos Modificados

1. **`src/middleware.ts`** - Protección de rutas mejorada
2. **`src/app/auth/login/page.tsx`** - Detección de roles en login
3. **`src/lib/auth.ts`** - Exportación de supabase client

## ✅ Resultado Esperado

Después de seguir estos pasos:
- Tu usuario (ADMIN_GENERAL) será redirigido al dashboard al hacer login
- Las rutas estarán protegidas según el rol del usuario
- Solo usuarios con rol ADMIN_CONDOMINIO irán al onboarding
- ADMIN_GENERAL tendrá acceso directo al dashboard

## 🐛 Si el Problema Persiste

1. **Limpia el cache del navegador**: 
   - F12 → Application → Storage → Clear Site Data
   
2. **Reinicia el servidor de desarrollo**:
   ```bash
   pkill -f "npm run dev"
   npm run dev
   ```

3. **Verifica en Supabase que el rol está asignado**:
   ```sql
   SELECT * FROM public.usuarios_roles_fraccionamiento 
   WHERE usuario_id = '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4';