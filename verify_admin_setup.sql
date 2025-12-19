-- Script de verificación para confirmar configuración de ADMIN_GENERAL
-- Usuario: rmonroy.rodriguez@gmail.com

DO $$
DECLARE
    admin_email TEXT := 'rmonroy.rodriguez@gmail.com';
    admin_user_id UUID := '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4';
    user_exists BOOLEAN;
    role_exists BOOLEAN;
    has_admin_role BOOLEAN;
BEGIN
    RAISE NOTICE '=== VERIFICACIÓN DE CONFIGURACIÓN ADMIN_GENERAL ===';
    RAISE NOTICE 'Usuario: %', admin_email;
    RAISE NOTICE 'User ID: %', admin_user_id;
    
    -- Verificar 1: Usuario existe en tabla usuarios
    SELECT EXISTS(SELECT 1 FROM public.usuarios WHERE id = admin_user_id) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE '✅ Usuario existe en tabla usuarios';
        
        SELECT 
            email,
            nombre,
            activo,
            creado_en
        INTO 
            admin_email,
            admin_email, -- We'll show this separately
            admin_email,
            admin_email
        FROM public.usuarios 
        WHERE id = admin_user_id;
        
    ELSE
        RAISE NOTICE '❌ Usuario NO existe en tabla usuarios';
    END IF;
    
    -- Verificar 2: Rol ADMIN_GENERAL existe
    SELECT EXISTS(SELECT 1 FROM public.roles WHERE nombre = 'ADMIN_GENERAL') INTO role_exists;
    
    IF role_exists THEN
        RAISE NOTICE '✅ Rol ADMIN_GENERAL existe';
        
        SELECT id, nivel_permisos 
        FROM public.roles 
        WHERE nombre = 'ADMIN_GENERAL';
        
    ELSE
        RAISE NOTICE '❌ Rol ADMIN_GENERAL NO existe';
    END IF;
    
    -- Verificar 3: Usuario tiene rol ADMIN_GENERAL asignado
    SELECT EXISTS(
        SELECT 1 
        FROM public.usuarios_roles_fraccionamiento ur
        JOIN public.roles r ON ur.rol_id = r.id
        WHERE ur.usuario_id = admin_user_id 
        AND r.nombre = 'ADMIN_GENERAL'
        AND ur.acceso_habilitado = true
    ) INTO has_admin_role;
    
    IF has_admin_role THEN
        RAISE NOTICE '✅ Usuario tiene rol ADMIN_GENERAL asignado y habilitado';
    ELSE
        RAISE NOTICE '❌ Usuario NO tiene rol ADMIN_GENERAL asignado o no está habilitado';
    END IF;
    
    -- Mostrar resumen completo
    RAISE NOTICE '=== RESUMEN COMPLETO ===';
    
    IF user_exists AND role_exists AND has_admin_role THEN
        RAISE NOTICE '🎉 CONFIGURACIÓN COMPLETA Y CORRECTA';
        RAISE NOTICE 'El usuario % tiene todos los permisos de ADMIN_GENERAL', admin_email;
    ELSE
        RAISE NOTICE '⚠️  CONFIGURACIÓN INCOMPLETA';
        
        IF NOT user_exists THEN
            RAISE NOTICE '   - Falta usuario en tabla usuarios';
        END IF;
        
        IF NOT role_exists THEN
            RAISE NOTICE '   - Falta rol ADMIN_GENERAL';
        END IF;
        
        IF NOT has_admin_role THEN
            RAISE NOTICE '   - Falta asignación de rol al usuario';
        END IF;
    END IF;
    
    -- Mostrar detalles del usuario y sus roles
    RAISE NOTICE '=== DETALLES DEL USUARIO ===';
    
    SELECT 
        u.email,
        u.nombre,
        u.activo,
        r.nombre as rol,
        r.nivel_permisos,
        ur.acceso_habilitado,
        ur.es_principal,
        ur.fecha_asignacion
    FROM public.usuarios u
    LEFT JOIN public.usuarios_roles_fraccionamiento ur ON u.id = ur.usuario_id
    LEFT JOIN public.roles r ON ur.rol_id = r.id
    WHERE u.id = admin_user_id
    OR u.email = admin_email;
    
END $$;