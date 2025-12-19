-- Script manual paso a paso para configurar ADMIN_GENERAL
-- Usuario: rmonroy.rodriguez@gmail.com

-- =====================================================
-- PASO 1: VERIFICAR USUARIO EN TABLA usuarios
-- =====================================================

-- Verificar si existe el usuario
SELECT * FROM public.usuarios WHERE email = 'rmonroy.rodriguez@gmail.com';

-- Si no existe, ejecutar:
-- INSERT INTO public.usuarios (id, email, nombre, activo) 
-- VALUES ('5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4', 'rmonroy.rodriguez@gmail.com', 'Ricardo Monroy Rodriguez', true);

-- =====================================================
-- PASO 2: VERIFICAR ROL ADMIN_GENERAL
-- =====================================================

-- Verificar que existe el rol ADMIN_GENERAL
SELECT * FROM public.roles WHERE nombre = 'ADMIN_GENERAL';

-- =====================================================
-- PASO 3: ASIGNAR ROL AL USUARIO
-- =====================================================

-- Asignar rol ADMIN_GENERAL al usuario
INSERT INTO public.usuarios_roles_fraccionamiento (
    usuario_id,
    fraccionamiento_id,
    rol_id,
    es_principal,
    acceso_habilitado
) VALUES (
    '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4',
    NULL,
    1, -- ID del rol ADMIN_GENERAL
    true,
    true
) ON CONFLICT (usuario_id, fraccionamiento_id, rol_id) DO UPDATE SET
    acceso_habilitado = true,
    es_principal = true;

-- =====================================================
-- PASO 4: VERIFICAR ASIGNACIÓN
-- =====================================================

-- Verificar que el rol se asignó correctamente
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