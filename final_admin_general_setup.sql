-- ====================================================================
-- CONFIGURACIÓN FINAL ADMIN_GENERAL EXCLUSIVO
-- ====================================================================
-- Usuario: rmonroy.rodriguez@gmail.com (ID: 5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4)
-- Objetivo: Que este usuario tenga ÚNICAMENTE el rol ADMIN_GENERAL
-- ====================================================================

DO $$
DECLARE
    target_user_id UUID := '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4';
    target_user_email TEXT := 'rmonroy.rodriguez@gmail.com';
    admin_general_role_id INTEGER := 1; -- ADMIN_GENERAL
    admin_condominio_role_id INTEGER := 3; -- ADMIN_CONDOMINIO
    aux_admin_condominio_role_id INTEGER := 4; -- AUX_ADMIN_CONDOMINIO
    current_roles_count INTEGER;
    roles_before_cleanup INTEGER;
    roles_after_cleanup INTEGER;
BEGIN
    RAISE NOTICE '=== INICIANDO CONFIGURACIÓN ADMIN_GENERAL EXCLUSIVO ===';
    RAISE NOTICE 'Usuario objetivo: % (%)', target_user_email, target_user_id;
    
    -- ====================================================================
    -- PASO 1: VERIFICAR ESTADO ACTUAL
    -- ====================================================================
    
    SELECT COUNT(*) INTO roles_before_cleanup
    FROM public.usuarios_roles_fraccionamiento ur
    WHERE ur.usuario_id = target_user_id;
    
    RAISE NOTICE 'Roles actuales del usuario: %', roles_before_cleanup;
    
    -- Mostrar roles actuales
    RAISE NOTICE 'Roles antes de la limpieza:';
    PERFORM 
        r.nombre as rol,
        r.nivel_permisos,
        ur.fraccionamiento_id,
        ur.acceso_habilitado
    FROM public.usuarios_roles_fraccionamiento ur
    JOIN public.roles r ON ur.rol_id = r.id
    WHERE ur.usuario_id = target_user_id
    ORDER BY r.nivel_permisos DESC;
    
    -- ====================================================================
    -- PASO 2: ELIMINAR ROLES INCOMPATIBLES (SOLO PARA ESTE USUARIO)
    -- ====================================================================
    
    -- Eliminar rol ADMIN_CONDOMINIO si existe
    DELETE FROM public.usuarios_roles_fraccionamiento 
    WHERE usuario_id = target_user_id 
    AND rol_id = admin_condominio_role_id;
    
    RAISE NOTICE 'Rol ADMIN_CONDOMINIO eliminado (si existía)';
    
    -- Eliminar rol AUX_ADMIN_CONDOMINIO si existe
    DELETE FROM public.usuarios_roles_fraccionamiento 
    WHERE usuario_id = target_user_id 
    AND rol_id = aux_admin_condominio_role_id;
    
    RAISE NOTICE 'Rol AUX_ADMIN_CONDOMINIO eliminado (si existía)';
    
    -- ====================================================================
    -- PASO 3: ASEGURAR QUE TENGA ADMIN_GENERAL
    -- ====================================================================
    
    -- Verificar si ya tiene ADMIN_GENERAL
    IF NOT EXISTS (
        SELECT 1 FROM public.usuarios_roles_fraccionamiento 
        WHERE usuario_id = target_user_id AND rol_id = admin_general_role_id
    ) THEN
        RAISE NOTICE 'Asignando rol ADMIN_GENERAL...';
        
        INSERT INTO public.usuarios_roles_fraccionamiento (
            usuario_id,
            fraccionamiento_id,
            rol_id,
            es_principal,
            acceso_habilitado
        ) VALUES (
            target_user_id,
            NULL, -- Admin general no está asociado a un condominio específico
            admin_general_role_id,
            true,
            true
        );
        
        RAISE NOTICE 'Rol ADMIN_GENERAL asignado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario ya tiene rol ADMIN_GENERAL';
        
        -- Asegurar que esté habilitado
        UPDATE public.usuarios_roles_fraccionamiento 
        SET 
            acceso_habilitado = true,
            es_principal = true,
            fraccionamiento_id = NULL -- Admin general no debe estar asociado a condominio
        WHERE usuario_id = target_user_id AND rol_id = admin_general_role_id;
        
        RAISE NOTICE 'Rol ADMIN_GENERAL confirmado y actualizado';
    END IF;
    
    -- ====================================================================
    -- PASO 4: VERIFICAR RESULTADO FINAL
    -- ====================================================================
    
    SELECT COUNT(*) INTO roles_after_cleanup
    FROM public.usuarios_roles_fraccionamiento ur
    WHERE ur.usuario_id = target_user_id;
    
    RAISE NOTICE 'Roles después de la limpieza: %', roles_after_cleanup;
    
    -- Mostrar resultado final
    RAISE NOTICE '=== ROLES FINALES ===';
    PERFORM 
        r.nombre as rol_final,
        r.nivel_permisos,
        ur.fraccionamiento_id,
        ur.acceso_habilitado,
        ur.es_principal
    FROM public.usuarios_roles_fraccionamiento ur
    JOIN public.roles r ON ur.rol_id = r.id
    WHERE ur.usuario_id = target_user_id
    ORDER BY r.nivel_permisos DESC;
    
    -- ====================================================================
    -- PASO 5: VALIDACIÓN FINAL
    -- ====================================================================
    
    IF roles_after_cleanup = 1 THEN
        -- Verificar que el único rol sea ADMIN_GENERAL
        IF EXISTS (
            SELECT 1 FROM public.usuarios_roles_fraccionamiento ur
            JOIN public.roles r ON ur.rol_id = r.id
            WHERE ur.usuario_id = target_user_id 
            AND r.nombre = 'ADMIN_GENERAL'
            AND ur.acceso_habilitado = true
        ) THEN
            RAISE NOTICE '=== ✅ CONFIGURACIÓN EXITOSA ===';
            RAISE NOTICE 'El usuario % ahora tiene ÚNICAMENTE el rol ADMIN_GENERAL', target_user_email;
            RAISE NOTICE 'Nivel de permisos: 100 (Máximo)';
            RAISE NOTICE 'Acceso habilitado: true';
        ELSE
            RAISE NOTICE '=== ❌ ERROR EN CONFIGURACIÓN ===';
            RAISE NOTICE 'El usuario no tiene el rol ADMIN_GENERAL asignado correctamente';
        END IF;
    ELSE
        RAISE NOTICE '=== ⚠️  ADVERTENCIA ===';
        RAISE NOTICE 'El usuario tiene % roles en lugar de 1', roles_after_cleanup;
        RAISE NOTICE 'Verificar manualmente los roles asignados';
    END IF;
    
END $$;