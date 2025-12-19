-- Limpiar roles de ADMIN_CONDOMINIO para el usuario ADMIN_GENERAL
-- Usuario: rmonroy.rodriguez@gmail.com

-- Verificar roles actuales del usuario
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

-- Eliminar roles de ADMIN_CONDOMINIO (ID: 3) si existen
DELETE FROM public.usuarios_roles_fraccionamiento 
WHERE usuario_id = '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4' 
AND rol_id = 3; -- ADMIN_CONDOMINIO

-- Eliminar roles de AUX_ADMIN_CONDOMINIO (ID: 4) si existen  
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