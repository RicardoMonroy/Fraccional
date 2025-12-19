# Fraccional – Validación y Reset de Configuración Supabase

Este documento describe cómo **resetear** la base de datos de Supabase para que el ORM aplique todas las migraciones desde cero, validar la configuración y dejar el proyecto listo para conectar con el código de Fraccional. [file:169][web:151]

> ⚠️ **Advertencia:** estos pasos borran todos los datos. Úsalos solo en desarrollo o cuando tengas claro que puedes perder la información actual.

---

## 1. Pre‑requisitos

- Proyecto Supabase ya creado (URL y claves en `.env.local`). [file:169]
- Supabase CLI instalado (`supabase --version`). [web:151]
- Migraciones locales listas, por ejemplo:
  - `supabase/migrations/001_initial_schema.sql`
  - `supabase/migrations/002_rls_policies.sql`
  - `supabase/migrations/003_auth_users_sync.sql`
  - `supabase/migrations/004_default_admin_condominio_role.sql` [file:169][file:168]

---

## 2. Reset de base de datos (en Supabase cloud)

Supabase no tiene un solo comando “drop all & recreate DB” en cloud; el procedimiento recomendado para desarrollo es:

1. **Descargar un backup de seguridad (opcional pero recomendado)** desde el panel de Supabase (Project Settings → Backups). [web:151]
2. En el panel de Supabase, ir a **SQL Editor**.
3. Crear y ejecutar un script que elimine todas las tablas del schema `public` (en desarrollo se puede hacer algo como):

```
DO $$
DECLARE
r RECORD;
BEGIN
-- Deshabilitar triggers de FK temporalmente
EXECUTE 'SET session_replication_role = replica';

FOR r IN
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
LOOP
EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE;', r.tablename);
END LOOP;

EXECUTE 'SET session_replication_role = DEFAULT';
END $$;
```


4. Limpiar también objetos relacionados (opcional):
   - Secuencias, views o funciones propias si las hubiera.

Con esto la BD queda vacía (solo con tablas internas de Supabase en otros schemas).

---

## 3. Aplicar migraciones desde el proyecto local con el ORM

Aunque no uses Supabase CLI para generar migraciones, puedes usarla para aplicar los `.sql` que ya tienes. [file:169]

### 3.1 Configurar Supabase CLI

1. Crear archivo `supabase/config.toml` (si no existe) con:

```
project_id = "TU_PROJECT_ID" # ver en Project Settings → General
```

2. Autenticarte:

```
supabase login
```


Se abrirá el navegador para que autorices.

### 3.2 Aplicar migraciones al proyecto remoto

Desde la raíz del proyecto:

Empuja todas las migraciones locales al proyecto remoto

```
supabase db push --db-url "$NEXT_PUBLIC_SUPABASE_URL/postgres?user=postgres&password=TU_DB_PASSWORD"
```
