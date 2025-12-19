-- Script simple para limpiar condominio específico
-- Ejecutar solo si conoces el ID del fraccionamiento

-- ====================================================================
-- OPCIÓN 1: LIMPIAR POR EMAIL DE USUARIO
-- ====================================================================

-- Reemplazar 'email@usuario.com' por el email real del usuario
DO $$
DECLARE
    target_user_email TEXT := 'rmonroy.rodriguez@gmail.com'; -- CAMBIAR ESTE EMAIL
    target_user_id UUID;
    fraccionamiento_id UUID;
BEGIN
    -- Encontrar usuario
    SELECT id INTO target_user_id
    FROM auth.users 
    WHERE email = target_user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'Usuario no encontrado: %', target_user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Limpiando datos para usuario: % (%)', target_user_email, target_user_id;
    
    -- Encontrar fraccionamiento del usuario
    SELECT ur.fraccionamiento_id INTO fraccionamiento_id
    FROM public.usuarios_roles_fraccionamiento ur
    WHERE ur.usuario_id = target_user_id
    AND ur.fraccionamiento_id IS NOT NULL
    LIMIT 1;
    
    IF fraccionamiento_id IS NOT NULL THEN
        RAISE NOTICE 'Fraccionamiento encontrado: %', fraccionamiento_id;
        
        -- Eliminar datos relacionados
        DELETE FROM public.casas WHERE fraccionamiento_id = fraccionamiento_id;
        DELETE FROM public.condominios_suscripciones WHERE fraccionamiento_id = fraccionamiento_id;
        DELETE FROM public.cargos WHERE fraccionamiento_id = fraccionamiento_id;
        DELETE FROM public.pagos WHERE fraccionamiento_id = fraccionamiento_id;
        DELETE FROM public.avisos WHERE fraccionamiento_id = fraccionamiento_id;
        DELETE FROM public.documentos WHERE fraccionamiento_id = fraccionamiento_id;
        DELETE FROM public.incidencias WHERE fraccionamiento_id = fraccionamiento_id;
        DELETE FROM public.fraccionamientos WHERE id = fraccionamiento_id;
        
        RAISE NOTICE 'Fraccionamiento y datos relacionados eliminados';
    ELSE
        RAISE NOTICE 'No se encontró fraccionamiento para este usuario';
    END IF;
    
    -- Limpiar rol del usuario
    DELETE FROM public.usuarios_roles_fraccionamiento 
    WHERE usuario_id = target_user_id;
    
    -- Reasignar rol limpio
    INSERT INTO public.usuarios_roles_fraccionamiento (
        usuario_id, fraccionamiento_id, rol_id, es_principal, acceso_habilitado
    ) VALUES (
        target_user_id, NULL, 3, true, true
    ) ON CONFLICT (usuario_id, fraccionamiento_id, rol_id) DO UPDATE SET
        acceso_habilitado = true, es_principal = true, fraccionamiento_id = NULL;
    
    RAISE NOTICE 'Usuario listo para nuevo onboarding';
END $$;

-- ====================================================================
-- OPCIÓN 2: LIMPIAR POR ID DE FRACCIONAMIENTO (SI LO CONOCES)
-- ====================================================================

-- Descomenta y ejecuta solo si conoces el ID del fraccionamiento:
-- Reemplazar 'uuid-del-fraccionamiento' por el ID real
/*
DO $$
DECLARE
    fraccionamiento_id UUID := 'uuid-del-fraccionamiento'; -- CAMBIAR ESTE UUID
BEGIN
    RAISE NOTICE 'Eliminando fraccionamiento: %', fraccionamiento_id;
    
    -- Eliminar datos relacionados
    DELETE FROM public.casas WHERE fraccionamiento_id = fraccionamiento_id;
    DELETE FROM public.condominios_suscripciones WHERE fraccionamiento_id = fraccionamiento_id;
    DELETE FROM public.cargos WHERE fraccionamiento_id = fraccionamiento_id;
    DELETE FROM public.pagos WHERE fraccionamiento_id = fraccionamiento_id;
    DELETE FROM public.avisos WHERE fraccionamiento_id = fraccionamiento_id;
    DELETE FROM public.documentos WHERE fraccionamiento_id = fraccionamiento_id;
    DELETE FROM public.incidencias WHERE fraccionamiento_id = fraccionamiento_id;
    DELETE FROM public.fraccionamientos WHERE id = fraccionamiento_id;
    
    -- Limpiar roles de usuarios asociados
    DELETE FROM public.usuarios_roles_fraccionamiento 
    WHERE fraccionamiento_id = fraccionamiento_id;
    
    RAISE NOTICE 'Fraccionamiento completamente eliminado';
END $$;
*/