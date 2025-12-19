-- 003_auth_users_sync.sql
-- Sincronización automática de auth.users → public.usuarios

-- Asegurar extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Tabla usuarios (por si aún no existe, id alineado con auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  telefono TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. Función para insertar usuario desde auth.users
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si ya existe en public.usuarios, solo actualiza email
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE id = NEW.id) THEN
    UPDATE public.usuarios
    SET email = NEW.email,
        actualizado_en = now()
    WHERE id = NEW.id;
  ELSE
    INSERT INTO public.usuarios (id, email, nombre)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nombre', NULL));
  END IF;

  RETURN NEW;
END;
$$;

-- 3. Trigger AFTER INSERT en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_created();

-- 4. (Opcional) sincronizar cambios de email
CREATE OR REPLACE FUNCTION public.handle_auth_user_updated()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.email IS DISTINCT FROM OLD.email THEN
    UPDATE public.usuarios
    SET email = NEW.email,
        actualizado_en = now()
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auth_user_updated();
