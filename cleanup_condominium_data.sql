-- ====================================================================
-- SCRIPT PARA LIMPIAR DATOS DE CONDOMINIO
-- ====================================================================
-- Este script limpia todos los datos relacionados con un condominio específico
-- Útil para cuando un usuario quiere volver a registrarse en el onboarding
-- ====================================================================

DO $$
DECLARE
    target_user_email TEXT := 'rmonroy.rodriguez@gmail.com'; -- Cambiar por el email del usuario
    target_user_id UUID;
    fraccionamiento_ids UUID[];
    casa_ids UUID[];
    suscripcion_ids UUID[];
    role_ids UUID[];
BEGIN
    RAISE NOTICE '=== INICIANDO LIMPIEZA DE DATOS DE CONDOMINIO ===';
    RAISE NOTICE 'Usuario objetivo: %', target_user_email;
    
    -- ====================================================================
    -- PASO 1: ENCONTRAR EL USUARIO
    -- ====================================================================
    
    SELECT id INTO target_user_id
    FROM auth.users 
    WHERE email = target_user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'Usuario no encontrado con email: %', target_user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Usuario encontrado con ID: %', target_user_id;
    
    -- ====================================================================
    -- PASO 2: ENCONTRAR FRACCIONAMIENTOS ASIGNADOS AL USUARIO
    -- ====================================================================
    
    SELECT array_agg(fraccionamiento_id) INTO fraccionamiento_ids
    FROM public.usuarios_roles_fraccionamiento
    WHERE usuario_id = target_user_id
    AND fraccionamiento_id IS NOT NULL;
    
    RAISE NOTICE 'Fraccionamientos encontrados: %', array_length(fraccionamiento_ids, 1);
    
    -- ====================================================================
    -- PASO 3: LIMPIAR DATOS RELACIONADOS CON FRACCIONAMIENTOS
    -- ====================================================================
    
    IF fraccionamiento_ids IS NOT NULL AND array_length(fraccionamiento_ids, 1) > 0 THEN
        FOREACH fraccionamiento_id IN ARRAY fraccionamiento_ids
        LOOP
            RAISE NOTICE 'Limpiando fraccionamiento: %', fraccionamiento_id;
            
            -- Eliminar casas
            DELETE FROM public.casas 
            WHERE fraccionamiento_id = fraccionamiento_id;
            RAISE NOTICE 'Casas eliminadas para fraccionamiento %', fraccionamiento_id;
            
            -- Eliminar suscripciones
            DELETE FROM public.condominios_suscripciones 
            WHERE fraccionamiento_id = fraccionamiento_id;
            RAISE NOTICE 'Suscripciones eliminadas para fraccionamiento %', fraccionamiento_id;
            
            -- Eliminar cargos
            DELETE FROM public.cargos 
            WHERE fraccionamiento_id = fraccionamiento_id;
            RAISE NOTICE 'Cargos eliminados para fraccionamiento %', fraccionamiento_id;
            
            -- Eliminar pagos
            DELETE FROM public.pagos 
            WHERE fraccionamiento_id = fraccionamiento_id;
            RAISE NOTICE 'Pagos eliminados para fraccionamiento %', fraccionamiento_id;
            
            -- Eliminar avisos
            DELETE FROM public.avisos 
            WHERE fraccionamiento_id = fraccionamiento_id;
            RAISE NOTICE 'Avisos eliminados para fraccionamiento %', fraccionamiento_id;
            
            -- Eliminar documentos
            DELETE FROM public.documentos 
            WHERE fraccionamiento_id = fraccionamiento_id;
            RAISE NOTICE 'Documentos eliminados para fraccionamiento %', fraccionamiento_id;
            
            -- Eliminar incidencias
            DELETE FROM public.incidencias 
            WHERE fraccionamiento_id = fraccionamiento_id;
            RAISE NOTICE 'Incidencias eliminadas para fraccionamiento %', fraccionamiento_id;
            
            -- Eliminar fraccionamiento
            DELETE FROM public.fraccionamientos 
            WHERE id = fraccionamiento_id;
            RAISE NOTICE 'Fraccionamiento eliminado: %', fraccionamiento_id;
        END LOOP;
    END IF;
    
    -- ====================================================================
    -- PASO 4: LIMPIAR ROLES DEL USUARIO
    -- ====================================================================
    
    DELETE FROM public.usuarios_roles_fraccionamiento 
    WHERE usuario_id = target_user_id;
    RAISE NOTICE 'Roles del usuario eliminados';
    
    -- ====================================================================
    -- PASO 5: ACTUALIZAR TABLA usuarios
    -- ====================================================================
    
    UPDATE public.usuarios 
    SET 
        activo = true,
        actualizado_en = now()
    WHERE id = target_user_id;
    RAISE NOTICE 'Usuario actualizado en tabla usuarios';
    
    -- ====================================================================
    -- PASO 6: ASIGNAR NUEVAMENTE ROL ADMIN_CONDOMINIO LIMPIO
    -- ====================================================================
    
    INSERT INTO public.usuarios_roles_fraccionamiento (
        usuario_id,
        fraccionamiento_id,
        rol_id,
        es_principal,
        acceso_habilitado
    ) VALUES (
        target_user_id,
        NULL, -- Sin fraccionamiento asignado
        3, -- ADMIN_CONDOMINIO
        true,
        true
    ) ON CONFLICT (usuario_id, fraccionamiento_id, rol_id) DO UPDATE SET
        acceso_habilitado = true,
        es_principal = true,
        fraccionamiento_id = NULL;
    
    RAISE NOTICE 'Rol ADMIN_CONDOMINIO重新 asignado sin fraccionamiento';
    
    -- ====================================================================
    -- PASO 7: VERIFICACIÓN FINAL
    -- ====================================================================
    
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    
    -- Verificar que el usuario existe
    PERFORM id, email, activo 
    FROM public.usuarios 
    WHERE id = target_user_id;
    
    -- Verificar roles actuales
    PERFORM 
        r.nombre as rol,
        ur.fraccionamiento_id,
        ur.acceso_habilitado
    FROM public.usuarios_roles_fraccionamiento ur
    JOIN public.roles r ON ur.rol_id = r.id
    WHERE ur.usuario_id = target_user_id;
    
    -- Contar fraccionamientos restantes
    RAISE NOTICE 'Fraccionamientos restantes para este usuario: %', (
        SELECT COUNT(*) 
        FROM public.usuarios_roles_fraccionamiento 
        WHERE usuario_id = target_user_id 
        AND fraccionamiento_id IS NOT NULL
    );
    
    RAISE NOTICE '=== LIMPIEZA COMPLETADA ===';
    RAISE NOTICE 'El usuario % puede volver a hacer onboarding', target_user_email;
    
END $$;