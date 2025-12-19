-- Script para asignar rol de ADMIN_GENERAL al usuario específico (CORREGIDO)
-- Usuario: rmonroy.rodriguez@gmail.com
-- ID de Supabase Auth: 5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4

-- =====================================================
-- PASO 1: VERIFICAR SI EL USUARIO EXISTE EN LA TABLA usuarios
-- =====================================================

DO $$
DECLARE
    user_id UUID := '5ca6b09e-ed9d-4b04-8f98-abdc7a5734e4';
    user_email TEXT := 'rmonroy.rodriguez@gmail.com';
    admin_role_id INTEGER := 1;
    existing_user_id UUID;
    user_count INTEGER;
    role_count INTEGER;
    assignment_count INTEGER;
BEGIN
    RAISE NOTICE '=== CONFIGURANDO ADMIN_GENERAL ===';
    RAISE NOTICE 'Usuario ID: %', user_id;
    RAISE NOTICE 'Email: %', user_email;
    RAISE NOTICE 'Rol ADMIN_GENERAL ID: %', admin_role_id;
    
    -- =====================================================
    -- PASO 2: VERIFICAR O CREAR REGISTRO EN TABLA usuarios
    -- =====================================================
    
    -- Verificar si ya existe el usuario en la tabla usuarios
    SELECT COUNT(*) INTO user_count
    FROM public.usuarios 
    WHERE id = user_id;
    
    IF user_count = 0 THEN
        RAISE NOTICE 'Creando registro en tabla usuarios...';
        
        INSERT INTO public.usuarios (
            id,
            email,
            nombre,
            activo
        ) VALUES (
            user_id,
            user_email,
            'Ricardo Monroy Rodriguez',
            true
        );
        
        RAISE NOTICE 'Usuario creado en tabla usuarios con ID: %', user_id;
    ELSE
        RAISE NOTICE 'Usuario ya existe en tabla usuarios';
        
        -- Actualizar información del usuario
        UPDATE public.usuarios 
        SET 
            nombre = 'Ricardo Monroy Rodriguez',
            activo = true,
            actualizado_en = now()
        WHERE id = user_id;
        
        RAISE NOTICE 'Información de usuario actualizada';
    END IF;
    
    -- =====================================================
    -- PASO 3: ASIGNAR ROL ADMIN_GENERAL
    -- =====================================================
    
    -- Verificar si ya tiene el rol asignado
    SELECT COUNT(*) INTO assignment_count
    FROM public.usuarios_roles_fraccionamiento 
    WHERE usuario_id = user_id AND rol_id = admin_role_id;
    
    IF assignment_count = 0 THEN
        RAISE NOTICE 'Asignando rol ADMIN_GENERAL...';
        
        INSERT INTO public.usuarios_roles_fraccionamiento (
            usuario_id,
            fraccionamiento_id,
            rol_id,
            es_principal,
            acceso_habilitado
        ) VALUES (
            user_id,
            NULL, -- NULL significa que es admin general sin asociación a condominio específico
            admin_role_id,
            true,
            true
        );
        
        RAISE NOTICE 'Rol ADMIN_GENERAL asignado exitosamente';
    ELSE
        RAISE NOTICE 'Usuario ya tiene rol ADMIN_GENERAL asignado';
        
        -- Asegurar que el acceso esté habilitado
        UPDATE public.usuarios_roles_fraccionamiento 
        SET 
            acceso_habilitado = true,
            es_principal = true
        WHERE usuario_id = user_id AND rol_id = admin_role_id;
        
        RAISE NOTICE 'Acceso de ADMIN_GENERAL confirmado';
    END IF;
    
    -- =====================================================
    -- PASO 4: VERIFICACIÓN FINAL
    -- =====================================================
    
    RAISE NOTICE '=== VERIFICACIÓN FINAL ===';
    
    -- Verificar usuario en tabla usuarios
    RAISE NOTICE 'Usuario en tabla usuarios:';
    PERFORM 
        id,
        email,
        nombre,
        activo,
        creado_en
    FROM public.usuarios 
    WHERE id = user_id;
    
    -- Verificar roles asignados
    RAISE NOTICE 'Roles asignados al usuario:';
    PERFORM 
        ur.id,
        r.nombre as rol_nombre,
        r.nivel_permisos,
        ur.acceso_habilitado,
        ur.es_principal,
        ur.fecha_asignacion
    FROM public.usuarios_roles_fraccionamiento ur
    JOIN public.roles r ON ur.rol_id = r.id
    WHERE ur.usuario_id = user_id;
    
    RAISE NOTICE '=== CONFIGURACIÓN COMPLETADA ===';
    RAISE NOTICE 'El usuario % ahora tiene permisos de ADMIN_GENERAL', user_email;
    
END $$;