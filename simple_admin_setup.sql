-- Script ultra-simple para ADMIN_GENERAL
-- Solo ejecuta estas consultas una por una:

-- 1. Crear/actualizar usuario en tabla usuarios
INSERT INTO public.usuarios (id, email, nombre, activo) 
VALUES ('5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4', 'rmonroy.rodriguez@gmail.com', 'Ricardo Monroy Rodriguez', true)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo,
    actualizado_en = now();

-- 2. Asignar rol ADMIN_GENERAL
INSERT INTO public.usuarios_roles_fraccionamiento (
    usuario_id,
    fraccionamiento_id,
    rol_id,
    es_principal,
    acceso_habilitado
) VALUES (
    '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4',
    NULL,
    1, -- ADMIN_GENERAL
    true,
    true
) ON CONFLICT (usuario_id, fraccionamiento_id, rol_id) DO UPDATE SET
    acceso_habilitado = true,
    es_principal = true;

-- 3. Verificar que funcionó
SELECT 
    u.email,
    u.nombre,
    r.nombre as rol,
    r.nivel_permisos,
    ur.acceso_habilitado
FROM public.usuarios u
JOIN public.usuarios_roles_fraccionamiento ur ON u.id = ur.usuario_id
JOIN public.roles r ON ur.rol_id = r.id
WHERE u.email = 'rmonroy.rodriguez@gmail.com';