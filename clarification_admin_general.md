# Clarificación: ADMIN_GENERAL Exclusivo

## 🎯 Objetivo
Que el usuario específico **rmonroy.rodriguez@gmail.com** (ID: 5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4) tenga **ÚNICAMENTE** el rol de **ADMIN_GENERAL** y **NO** tenga el rol de **ADMIN_CONDOMINIO**.

## 📋 Lo que NO se está haciendo:
- ❌ Eliminar el rol ADMIN_CONDOMINIO del sistema
- ❌ Afectar a otros usuarios
- ❌ Modificar la estructura de la base de datos

## ✅ Lo que SÍ se está haciendo:
- ✅ Limpiar roles de ADMIN_CONDOMINIO **solo para tu usuario específico**
- ✅ Mantener solo el rol ADMIN_GENERAL para tu usuario
- ✅ Otros usuarios seguirán teniendo sus roles normalmente

## 🔍 Verificación Actual
Para ver qué roles tiene actualmente tu usuario:

```sql
SELECT 
    u.email,
    r.nombre as rol_actual,
    r.nivel_permisos,
    ur.fraccionamiento_id,
    ur.acceso_habilitado
FROM public.usuarios_roles_fraccionamiento ur
JOIN public.roles r ON ur.rol_id = r.id
JOIN public.usuarios u ON ur.usuario_id = u.id
WHERE u.email = 'rmonroy.rodriguez@gmail.com'
ORDER BY r.nivel_permisos DESC;
```

## 🎯 Resultado Esperado Después de la Limpieza:
Tu usuario debería tener **ÚNICAMENTE**:
- rol: ADMIN_GENERAL
- nivel_permisos: 100
- acceso_habilitado: true

**NO debería tener:**
- ❌ ADMIN_CONDOMINIO
- ❌ AUX_ADMIN_CONDOMINIO
- ❌ Ningún otro rol

## 💡 Por qué esto es importante:
- ADMIN_GENERAL debe tener acceso a todo el sistema sin restricciones
- No debe estar limitado a un condominio específico
- Debe poder invitar y gestionar otros usuarios
- El rol ADMIN_CONDOMINIO está diseñado para administradores de condominios específicos