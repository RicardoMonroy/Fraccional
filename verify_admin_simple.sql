-- Verificación simple de ADMIN_GENERAL
-- Solo ejecuta esta consulta:

SELECT 
    u.email,
    u.nombre,
    u.activo as usuario_activo,
    r.nombre as rol,
    r.nivel_permisos,
    ur.acceso_habilitado,
    ur.es_principal,
    ur.fecha_asignacion
FROM public.usuarios u
LEFT JOIN public.usuarios_roles_fraccionamiento ur ON u.id = ur.usuario_id
LEFT JOIN public.roles r ON ur.rol_id = r.id
WHERE u.email = 'rmonroy.rodriguez@gmail.com' 
   OR u.id = '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4';