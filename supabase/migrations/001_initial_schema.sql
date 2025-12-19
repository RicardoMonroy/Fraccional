-- 001_initial_schema.sql
-- Esquema inicial completo de Fraccional

-- =====================================================
-- EXTENSIONES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLAS BASE DEL SISTEMA
-- =====================================================

-- 1. Roles del sistema
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  nivel_permisos INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. Paquetes de suscripción
CREATE TABLE IF NOT EXISTS public.paquetes (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  precio_mensual DECIMAL(10,2) NOT NULL,
  max_casas INTEGER NOT NULL,
  caracteristicas JSONB,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 3. Fraccionamientos/Condominios
CREATE TABLE IF NOT EXISTS public.fraccionamientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT,
  ciudad TEXT,
  estado TEXT,
  codigo_postal TEXT,
  telefono TEXT,
  email TEXT,
  logo_url TEXT,
  configuracion JSONB,
  estado_servicio TEXT DEFAULT 'ACTIVO', -- ACTIVO, SUSPENDIDO, CANCELADO
  fecha_suspension TIMESTAMPTZ,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 4. Usuarios (sincronizados con auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT,
  telefono TEXT,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 5. Relación usuarios-roles-fraccionamiento (multitenancy)
CREATE TABLE IF NOT EXISTS public.usuarios_roles_fraccionamiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fraccionamiento_id UUID REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  rol_id INTEGER NOT NULL REFERENCES public.roles(id),
  es_principal BOOLEAN DEFAULT false,
  acceso_habilitado BOOLEAN DEFAULT true,
  fecha_asignacion TIMESTAMPTZ DEFAULT now(),
  creado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(usuario_id, fraccionamiento_id, rol_id)
);

-- =====================================================
-- TABLAS DE PROPIEDADES
-- =====================================================

-- 6. Casas/Unidades
CREATE TABLE IF NOT EXISTS public.casas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  numero_casa TEXT NOT NULL,
  direccion_especifica TEXT,
  metraje DECIMAL(8,2),
  habitaciones INTEGER DEFAULT 1,
  banos INTEGER DEFAULT 1,
  cochera BOOLEAN DEFAULT false,
  caracteristicas JSONB,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fraccionamiento_id, numero_casa)
);

-- 7. Propietarios de casas
CREATE TABLE IF NOT EXISTS public.propietarios_casas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casa_id UUID NOT NULL REFERENCES public.casas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  fecha_adquisicion DATE,
  porcentaje_propiedad DECIMAL(5,2) DEFAULT 100.00,
  es_propietario_principal BOOLEAN DEFAULT true,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(casa_id, usuario_id)
);

-- 8. Habitantes de casas
CREATE TABLE IF NOT EXISTS public.habitantes_casas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  casa_id UUID NOT NULL REFERENCES public.casas(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  tipo_habitante TEXT DEFAULT 'RESIDENTE', -- RESIDENTE, FAMILIAR, EMPLEADO
  fecha_ingreso DATE,
  fecha_salida DATE,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(casa_id, usuario_id)
);

-- =====================================================
-- TABLAS FINANCIERAS
-- =====================================================

-- 9. Suscripciones de condominios
CREATE TABLE IF NOT EXISTS public.condominios_suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  paquete_id INTEGER NOT NULL REFERENCES public.paquetes(id),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  estado TEXT DEFAULT 'ACTIVA', -- ACTIVA, EXPIRADA, CANCELADA
  precio_pagado DECIMAL(10,2),
  notas TEXT,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 10. Cargos (cuotas, multas, etc.)
CREATE TABLE IF NOT EXISTS public.cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  casa_id UUID NOT NULL REFERENCES public.casas(id) ON DELETE CASCADE,
  tipo_cargo TEXT NOT NULL, -- CUOTA_ORDINARIA, CUOTA_EXTRAORDINARIA, MULTA, RECARGO
  concepto TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  estado TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO, VENCIDO, CONDONADO
  mes_cubierto DATE, -- Para cuotas mensuales
  año_cubierto INTEGER, -- Para cuotas anuales
  created_by UUID REFERENCES public.usuarios(id),
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 11. Pagos de residents
CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  casa_id UUID NOT NULL REFERENCES public.casas(id) ON DELETE CASCADE,
  cargo_id UUID REFERENCES public.cargos(id) ON DELETE SET NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  metodo_pago TEXT, -- EFECTIVO, TRANSFERENCIA, CHEQUE, TARJETA
  referencia_bancaria TEXT,
  estado TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADO, RECHAZADO
  comprobante_url TEXT,
  observaciones TEXT,
  approved_by UUID REFERENCES public.usuarios(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.usuarios(id),
  rejected_at TIMESTAMPTZ,
  motivo_rechazo TEXT,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 12. Pagos de suscripción SaaS
CREATE TABLE IF NOT EXISTS public.pagos_condominio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  fecha_pago DATE NOT NULL,
  periodo_mes INTEGER NOT NULL,
  periodo_año INTEGER NOT NULL,
  metodo_pago TEXT,
  referencia_bancaria TEXT,
  estado TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, APROBADO, RECHAZADO
  comprobante_url TEXT,
  observaciones TEXT,
  approved_by UUID REFERENCES public.usuarios(id),
  approved_at TIMESTAMPTZ,
  rejected_by UUID REFERENCES public.usuarios(id),
  rejected_at TIMESTAMPTZ,
  motivo_rechazo TEXT,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLAS DE COMUNICACIÓN
-- =====================================================

-- 13. Avisos
CREATE TABLE IF NOT EXISTS public.avisos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  tipo_aviso TEXT DEFAULT 'GENERAL', -- GENERAL, URGENTE, MANTENIMIENTO, EVENTO
  fecha_publicacion TIMESTAMPTZ DEFAULT now(),
  fecha_vencimiento TIMESTAMPTZ,
  publicado_por UUID NOT NULL REFERENCES public.usuarios(id),
  es_destacado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 14. Documentos
CREATE TABLE IF NOT EXISTS public.documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT, -- REGLAMENTO, ACTA, CONTRATO, MANUAL, OTRO
  archivo_url TEXT NOT NULL,
  archivo_nombre TEXT NOT NULL,
  archivo_tamaño INTEGER,
  mime_type TEXT,
  es_publico BOOLEAN DEFAULT false,
  subido_por UUID NOT NULL REFERENCES public.usuarios(id),
  fecha_publicacion TIMESTAMPTZ DEFAULT now(),
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLAS DE INCIDENCIAS
-- =====================================================

-- 15. Incidencias
CREATE TABLE IF NOT EXISTS public.incidencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fraccionamiento_id UUID NOT NULL REFERENCES public.fraccionamientos(id) ON DELETE CASCADE,
  casa_id UUID REFERENCES public.casas(id) ON DELETE SET NULL,
  reportado_por UUID NOT NULL REFERENCES public.usuarios(id),
  asignado_a UUID REFERENCES public.usuarios(id),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT, -- MANTENIMIENTO, SEGURIDAD, RUIDO, LIMPIEZA, OTRO
  prioridad TEXT DEFAULT 'MEDIA', -- BAJA, MEDIA, ALTA, URGENTE
  estado TEXT DEFAULT 'ABIERTA', -- ABIERTA, EN_PROCESO, RESUELTA, CERRADA
  ubicacion_especifica TEXT,
  fecha_resolucion TIMESTAMPTZ,
  fecha_cierre TIMESTAMPTZ,
  costo_estimado DECIMAL(10,2),
  costo_real DECIMAL(10,2),
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 16. Comentarios de incidencias
CREATE TABLE IF NOT EXISTS public.incidencias_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incidencia_id UUID NOT NULL REFERENCES public.incidencias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  comentario TEXT NOT NULL,
  es_interno BOOLEAN DEFAULT false, -- Solo para admins
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- TABLAS DE LANDING PAGE
-- =====================================================

-- 17. Configuración de landing
CREATE TABLE IF NOT EXISTS public.landing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo_principal TEXT,
  subtitulo TEXT,
  descripcion TEXT,
  colores JSONB, -- Paleta de colores personalizada
  configuracion_general JSONB,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 18. Secciones de landing
CREATE TABLE IF NOT EXISTS public.landing_secciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id UUID NOT NULL REFERENCES public.landing_config(id) ON DELETE CASCADE,
  tipo_seccion TEXT NOT NULL, -- HERO, CARACTERISTICAS, TESTIMONIOS, FAQ
  titulo TEXT,
  contenido JSONB,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 19. Detalles de paquetes en landing
CREATE TABLE IF NOT EXISTS public.landing_paquetes_detalle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_id UUID NOT NULL REFERENCES public.landing_config(id) ON DELETE CASCADE,
  paquete_id INTEGER NOT NULL REFERENCES public.paquetes(id),
  descripcion_larga TEXT,
  caracteristicas_destacadas JSONB,
  precio_personalizado DECIMAL(10,2),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMPTZ DEFAULT now(),
  actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices en tablas principales
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON public.usuarios(activo);

CREATE INDEX IF NOT EXISTS idx_usuarios_roles_usuario ON public.usuarios_roles_fraccionamiento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_fraccionamiento ON public.usuarios_roles_fraccionamiento(fraccionamiento_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON public.usuarios_roles_fraccionamiento(rol_id);

CREATE INDEX IF NOT EXISTS idx_casas_fraccionamiento ON public.casas(fraccionamiento_id);
CREATE INDEX IF NOT EXISTS idx_casas_numero ON public.casas(fraccionamiento_id, numero_casa);

CREATE INDEX IF NOT EXISTS idx_propietarios_casa ON public.propietarios_casas(casa_id);
CREATE INDEX IF NOT EXISTS idx_propietarios_usuario ON public.propietarios_casas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_habitantes_casa ON public.habitantes_casas(casa_id);
CREATE INDEX IF NOT EXISTS idx_habitantes_usuario ON public.habitantes_casas(usuario_id);

CREATE INDEX IF NOT EXISTS idx_cargos_fraccionamiento ON public.cargos(fraccionamiento_id);
CREATE INDEX IF NOT EXISTS idx_cargos_casa ON public.cargos(casa_id);
CREATE INDEX IF NOT EXISTS idx_cargos_estado ON public.cargos(estado);
CREATE INDEX IF NOT EXISTS idx_cargos_vencimiento ON public.cargos(fecha_vencimiento);

CREATE INDEX IF NOT EXISTS idx_pagos_fraccionamiento ON public.pagos(fraccionamiento_id);
CREATE INDEX IF NOT EXISTS idx_pagos_casa ON public.pagos(casa_id);
CREATE INDEX IF NOT EXISTS idx_pagos_estado ON public.pagos(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha ON public.pagos(fecha_pago);

CREATE INDEX IF NOT EXISTS idx_avisos_fraccionamiento ON public.avisos(fraccionamiento_id);
CREATE INDEX IF NOT EXISTS idx_avisos_fecha ON public.avisos(fecha_publicacion);

CREATE INDEX IF NOT EXISTS idx_incidencias_fraccionamiento ON public.incidencias(fraccionamiento_id);
CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON public.incidencias(estado);
CREATE INDEX IF NOT EXISTS idx_incidencias_prioridad ON public.incidencias(prioridad);

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

-- Comentarios para documentación
COMMENT ON TABLE public.roles IS 'Roles del sistema: ADMIN_GENERAL, ADMIN_CONDOMINIO, DUENO, HABITANTE, etc.';
COMMENT ON TABLE public.fraccionamientos IS 'Condominios/fraccionamientos administrados en la plataforma';
COMMENT ON TABLE public.usuarios IS 'Perfiles de usuarios sincronizados con Supabase Auth';
COMMENT ON TABLE public.usuarios_roles_fraccionamiento IS 'Relación multitenancy: usuario-rol-fraccionamiento';
COMMENT ON TABLE public.casas IS 'Unidades/casas dentro de cada fraccionamiento';
COMMENT ON TABLE public.cargos IS 'Cuotas, multas y recargos asignados a cada casa';
COMMENT ON TABLE public.pagos IS 'Pagos realizados por los residents con comprobantes';
COMMENT ON TABLE public.pagos_condominio IS 'Pagos de suscripción SaaS de cada condominio';