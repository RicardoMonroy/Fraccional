-- 004_default_admin_condominio_role.sql
-- Rol inicial ADMIN_CONDOMINIO para todo usuario nuevo

-- 1. Asegurar tablas base (se asume creadas en 001_initial_schema.sql)
--    - public.roles
--    - public.usuarios_roles_fraccionamiento

-- 2. Función para asignar ADMIN_CONDOMINIO global
CREATE OR REPLACE FUNCTION public.assign_default_admin_condominio_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_condominio_id INT;
BEGIN
  SELECT id INTO v_admin_condominio_id
  FROM public.roles
  WHERE nombre = 'ADMIN_CONDOMINIO';

  IF v_admin_condominio_id IS NULL THEN
    RAISE EXCEPTION 'Rol ADMIN_CONDOMINIO no existe en tabla roles';
  END IF;

  -- Insertar solo si no tiene ya algún rol global
  IF NOT EXISTS (
    SELECT 1
    FROM public.usuarios_roles_fraccionamiento urf
    WHERE urf.usuario_id = NEW.id
      AND urf.fraccionamiento_id IS NULL
      AND urf.rol_id = v_admin_condominio_id
  ) THEN
    INSERT INTO public.usuarios_roles_fraccionamiento (
      usuario_id,
      fraccionamiento_id,
      rol_id,
      es_principal,
      acceso_habilitado
    )
    VALUES (
      NEW.id,
      NULL, -- rol global, aún sin fraccionamiento
      v_admin_condominio_id,
      true,
      true
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Trigger AFTER INSERT en public.usuarios
DROP TRIGGER IF EXISTS on_public_user_created_assign_role ON public.usuarios;

CREATE TRIGGER on_public_user_created_assign_role
AFTER INSERT ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_admin_condominio_role();
