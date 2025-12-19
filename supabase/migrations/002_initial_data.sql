-- 002_initial_data.sql
-- Datos iniciales del sistema: roles y paquetes

-- =====================================================
-- DATOS INICIALES - ROLES
-- =====================================================

-- Insertar roles del sistema
INSERT INTO public.roles (id, nombre, descripcion, nivel_permisos) VALUES
(1, 'ADMIN_GENERAL', 'Administrador general de la plataforma Fraccional', 100),
(2, 'AUX_ADMIN_GENERAL', 'Auxiliar de administrador general', 90),
(3, 'ADMIN_CONDOMINIO', 'Administrador de condominio (cliente principal)', 80),
(4, 'AUX_ADMIN_CONDOMINIO', 'Auxiliar de administrador de condominio', 70),
(5, 'DUENO', 'Propietario de casa', 30),
(6, 'HABITANTE', 'Habitante/residente de casa', 20)
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- DATOS INICIALES - PAQUETES
-- =====================================================

-- Insertar paquetes de suscripción
INSERT INTO public.paquetes (id, nombre, descripcion, precio_mensual, max_casas, caracteristicas) VALUES
(
  1,
  'Básico',
  'Paquete ideal para condominios pequeños hasta 20 casas',
  299.00,
  20,
  '{
    "funcionalidades": [
      "Gestión de casas y propietarios",
      "Control de cuotas ordinarias",
      "Avisos básicos",
      "Reportes simples",
      "Soporte por email"
    ],
    "limitaciones": {
      "casas_maximas": 20,
      "usuarios_por_casa": 2,
      "almacenamiento_mb": 100
    }
  }'::jsonb
),
(
  2,
  'Profesional',
  'Paquete completo para condominios medianos hasta 50 casas',
  499.00,
  50,
  '{
    "funcionalidades": [
      "Todo lo del plan Básico",
      "Cuotas extraordinarias y multas",
      "Gestión de incidencias",
      "Documentos compartidos",
      "Reportes avanzados",
      "Invitaciones automáticas",
      "Soporte telefónico"
    ],
    "limitaciones": {
      "casas_maximas": 50,
      "usuarios_por_casa": 5,
      "almacenamiento_mb": 500
    }
  }'::jsonb
),
(
  3,
  'Empresarial',
  'Solución completa para grandes fraccionamientos y desarrollos',
  799.00,
  200,
  '{
    "funcionalidades": [
      "Todo lo del plan Profesional",
      "Casos ilimitados por casa",
      "API personalizada",
      "Reportes personalizados",
      "Integraciones externas",
      "Gerente de cuenta dedicado",
      "Soporte 24/7"
    ],
    "limitaciones": {
      "casas_maximas": 200,
      "usuarios_por_casa": "ilimitado",
      "almacenamiento_mb": 2000
    }
  }'::jsonb
)
ON CONFLICT (nombre) DO NOTHING;

-- =====================================================
-- DATOS INICIALES - CONFIGURACIÓN DE LANDING
-- =====================================================

-- Configuración básica de la landing page
INSERT INTO public.landing_config (
  id,
  titulo_principal,
  subtitulo,
  descripcion,
  colores
) VALUES (
  gen_random_uuid(),
  'Fraccional',
  'La plataforma más completa para la gestión de condominios',
  'Administra tu fraccionamiento de manera eficiente. Controla cuotas, gestiona incidencias y mantén comunicación fluida con todos los propietarios.',
  '{
    "brand-blue-primary": "#1976D2",
    "brand-blue-dark": "#115293",
    "brand-teal-accent": "#26A69A",
    "brand-background": "#F5F7FB",
    "brand-gray-light": "#90A4AE",
    "brand-red-alert": "#EF5350"
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- =====================================================

-- Mostrar roles insertados
DO $$
BEGIN
  RAISE NOTICE '=== ROLES CREADOS ===';
  RAISE NOTICE 'Total roles: %', (SELECT COUNT(*) FROM public.roles);
  
  RAISE NOTICE '=== PAQUETES CREADOS ===';
  RAISE NOTICE 'Total paquetes: %', (SELECT COUNT(*) FROM public.paquetes);
  
  RAISE NOTICE '=== CONFIGURACIÓN LANDING ===';
  RAISE NOTICE 'Total configuraciones: %', (SELECT COUNT(*) FROM public.landing_config);
END $$;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON TABLE public.roles IS 'Roles básicos del sistema insertados';
COMMENT ON TABLE public.paquetes IS 'Paquetes de suscripción SaaS con precios y características';
COMMENT ON TABLE public.landing_config IS 'Configuración inicial de la página de aterrizaje';