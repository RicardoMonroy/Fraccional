# Fraccional – Especificaciones Técnicas (versión simplificada)

**Fecha:** Diciembre 2025  
**Stack:** Next.js (App Router) + Supabase (Postgres, Auth, Storage) + ORM (Prisma o cliente PostgREST)

---

## 1. Visión general

Fraccional es una plataforma SaaS minimalista para la administración de fraccionamientos y condominios pequeños y medianos. [file:168]

Permite a los **Administradores de Condominio (AC)**:

- Gestionar casas, propietarios y habitantes.
- Crear cargos (cuotas, extraordinarios, multas, recargos).
- Recibir registros de pagos con comprobantes.
- Publicar avisos y documentos.
- Registrar y gestionar incidencias. [file:168]

Los **Dueños de Casa (DC)** y **Habitantes (HAB)** acceden solo por invitación y usan la plataforma para consultar información y registrar pagos o incidencias. [file:168]

---

## 2. Roles y modelo de acceso

### 2.1 Roles

Se mantienen los roles definidos en la especificación original: [file:168]

- `ADMIN_GENERAL` (AG) – controla Fraccional (paquetes, fraccionamientos, validación pagos SaaS).
- `AUX_ADMIN_GENERAL` (Aux-AG).
- `ADMIN_CONDOMINIO` (AC) – cliente principal.
- `AUX_ADMIN_CONDOMINIO` (Aux-AC).
- `DUENO` – dueño de casa.
- `HABITANTE`.  

Tabla `roles` con inserts iniciales ya definidos en las migraciones existentes. [file:168]

### 2.2 Clientes e invitados

- **Cliente**: siempre es un `ADMIN_CONDOMINIO` (AC).  
  - Es el único rol que se registra mediante formulario de signup.
- **Usuarios invitados**:
  - `DUENO` y `HABITANTE` no se registran por formulario; solo acceden mediante invitación enviada por AC (o por DC para HAB). [file:168]

---

## 3. Autenticación y sincronización de usuarios

### 3.1 Supabase Auth como fuente de credenciales

- Supabase Auth gestiona email/password, sesiones y tokens JWT en la tabla `auth.users`. [web:151]
- `auth.uid()` se usa en RLS para identificar al usuario actual en Postgres. [web:153]

### 3.2 Tabla `public.usuarios`

Tabla de dominio para toda la lógica de negocio:

```
CREATE TABLE IF NOT EXISTS public.usuarios (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
email TEXT UNIQUE NOT NULL,
nombre TEXT,
telefono TEXT,
activo BOOLEAN DEFAULT true,
creado_en TIMESTAMPTZ DEFAULT now(),
actualizado_en TIMESTAMPTZ DEFAULT now()
);
```


### 3.3 Sincronización automática auth.users → public.usuarios

Reglas:

1. Cada registro en `auth.users` debe tener una fila correspondiente en `public.usuarios` con el mismo `id`. [web:148][web:155]
2. Al crear un usuario en Auth (signup o invitación), se debe crear automáticamente un registro en `public.usuarios`.
3. Opcionalmente, cuando cambie el email en Auth, se reflejará en `public.usuarios.email`.

Se implementa mediante triggers y funciones en Postgres (ver archivos `sql` más abajo).

### 3.4 Rol automático inicial

Regla:

- Todo usuario que se registra mediante el formulario de la app se convierte por defecto en `ADMIN_CONDOMINIO` global (sin `fraccionamiento_id`). [file:168]

Implementación:

- Trigger AFTER INSERT en `public.usuarios` que inserta una fila en `usuarios_roles_fraccionamiento` con:
  - `usuario_id = NEW.id`
  - `rol_id` del rol `ADMIN_CONDOMINIO`
  - `fraccionamiento_id = NULL`
  - `es_principal = true`
  - `acceso_habilitado = true`  

Para invitados (DC y HAB) se gestionarán roles y relaciones desde el backend (no por trigger) cuando el AC/DC los cree.

---

## 4. Modelo de datos (resumen)

Se mantiene el modelo definido en `Fraccional_Especificacion_Completa.md`, incluyendo: [file:168]

- `usuarios`, `roles`, `usuarios_roles_fraccionamiento`
- `paquetes`, `fraccionamientos`, `condominios_suscripciones`
- `casas`, `propietarios_casas`, `habitantes_casas`
- `cargos`, `pagos`, `pagos_condominio`
- `avisos`, `documentos`
- `incidencias`, `incidencias_comentarios`
- Tablas para landing (`landing_config`, `landing_secciones`, `landing_paquetes_detalle`)

Con el esquema multi-tenant usando `fraccionamiento_id` en las tablas de dominio. [file:168]

---

## 5. Modelo de negocio y flujos clave

### 5.1 Onboarding de Administrador de Condominio (cliente)

1. El visitante llega a la landing pública.
2. Hace clic en “Comenzar como administrador”.
3. Signup en Supabase Auth con email y contraseña.
4. Trigger crea registro en `usuarios` y le asigna rol `ADMIN_CONDOMINIO` global. [file:168]
5. Primer login redirige al flujo “Crear primer condominio”, donde el AC:
   - Llena datos del fraccionamiento.
   - Define número de casas.
6. Backend (ORM):
   - Determina el paquete (`paquetes`) según número de casas.
   - Crea `fraccionamientos`.
   - Genera `casas`.
   - Crea `condominios_suscripciones`.
   - Inserta rol `ADMIN_CONDOMINIO` asociado al nuevo `fraccionamiento_id`. [file:168]

### 5.2 Gestión de propietarios e invitados

- AC puede:
  - Registrar propietarios (DC) para casas específicas.
  - El backend:
    - Crea usuario (Auth + `usuarios` si no existe).
    - Crea `propietarios_casas`.
    - Asigna rol `DUENO` en `usuarios_roles_fraccionamiento`.
    - Envía invitación de acceso (email). [file:168][web:151]
- DC puede invitar habitantes:
  - Se crean/usan usuarios y se insertan filas en `habitantes_casas` y `usuarios_roles_fraccionamiento` con rol `HABITANTE`. [file:168]

### 5.3 Cobranza y pagos internos

- AC crea `cargos` por casa.
- DC/AC registra `pagos` con comprobante en bucket `comprobantes`. [file:169]
- AC/Aux-AC revisa y cambia estado a `APROBADO` o `RECHAZADO`. [file:168]

### 5.4 Cobranza SaaS (Fraccional)

- AC sube comprobantes de pago de suscripción a `pagos_condominio`. [file:168]
- AG/Aux-AG revisa y aprueba/rechaza.
- Morosidad del SaaS puede marcar fraccionamiento como `SUSPENDIDO` y deshabilitar acceso (`acceso_habilitado = false`). [file:168]

---

## 6. Paleta de colores y diseño de UI

A partir del logotipo de Fraccional:

- `--brand-blue-primary`: `#1976D2`  
- `--brand-blue-dark`: `#115293`  
- `--brand-teal-accent`: `#26A69A`  
- `--brand-background`: `#F5F7FB`  
- `--brand-gray-light`: `#90A4AE`  
- `--brand-red-alert`: `#EF5350`  
- `--white`: `#FFFFFF`

Uso recomendado:

- Fondo global de la app: `brand-background`.
- Tarjetas, modales, paneles: `white` con sombras suaves.
- Botones primarios y elementos de acción: `brand-blue-primary` (hover `brand-blue-dark`).
- Estados de éxito/activos: `brand-teal-accent`.
- Estados de error/morosidad: `brand-red-alert`.
- Texto cuerpos: `brand-blue-dark`; texto secundario: `brand-gray-light`.

---

## 7. Uso de ORM y acceso a datos

- Se centraliza acceso a BD en un módulo `db` (p. ej. Prisma) que mapea todas las tablas del dominio. [file:168]
- Todas las operaciones se realizan desde el backend de Next (Server Actions / route handlers) usando el ORM:
  - No se escriben queries SQL manuales en el código de la app.
- Migraciones SQL se mantienen en carpeta `supabase/migrations` y se aplican desde Supabase o mediante CLI.

---

## 8. Plan de implementación por fases

### Fase 0 – Reset de proyecto

- Crear nuevo repositorio Next.js (App Router).
- Configurar Tailwind y shadcn/ui con la paleta anterior.
- Configurar cliente Supabase en `/src/lib/supabaseClient.ts`.

### Fase 1 – BD y Auth simplificada

- Aplicar migraciones de esquema original (`001_initial_schema.sql`). [file:169][file:168]
- Aplicar migraciones nuevas:
  - `003_auth_users_sync.sql` (sincronización auth.users → usuarios).
  - `004_default_admin_condominio_role.sql` (rol inicial AC).  
- Revisar y ajustar RLS para permitir a AC global crear su primer fraccionamiento y datos relacionados. [file:112][web:153]

### Fase 2 – Onboarding de AC

- Implementar landing page.
- Implementar flujo de signup (Auth) + redirección a “Crear condominio”.
- Implementar server actions para crear fraccionamiento, casas y suscripción.
- Crear dashboard básico de AC.

### Fase 3 – Gestión interna del condominio

- CRUD de casas.
- Gestión de propietarios (DC) con invitaciones.
- Gestión de habitantes (HAB) desde portal de DC.
- Ajustar RLS para DC/HAB.

### Fase 4 – Cargos y pagos

- CRUD de `cargos`.
- Registro y revisión de `pagos` con comprobantes.
- Reportes básicos de morosidad para AC.

### Fase 5 – Cobranza SaaS y panel AG

- Implementar panel simple para AG/Aux-AG.
- Gestión de `pagos_condominio` y `estado_servicio`.
- Manejo de suspensión de acceso (`acceso_habilitado`).

---
