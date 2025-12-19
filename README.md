# Fraccional - Gestión de Condominios

Una plataforma SaaS completa para la administración de fraccionamientos y condominios pequeños y medianos.

## 🚀 Características Principales

- **Gestión de Propiedades**: Administra casas, propietarios y residents
- **Control Financiero**: Gestiona cuotas, pagos y reportes en tiempo real
- **Comunicación**: Publica avisos, documentos y mantén comunicación constante
- **Gestión de Incidencias**: Registra y gestiona incidencias de manera organizada
- **Panel de Administración**: Dashboard completo para administradores de condominio
- **Portal de Usuarios**: Interfaces específicas para propietarios y residents

## 🏗️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + Server Actions
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Autenticación**: Supabase Auth
- **Almacenamiento**: Supabase Storage
- **Despliegue**: Vercel + Supabase

## 🎨 Diseño y Branding

### Paleta de Colores
- **Azul Primario**: `#1976D2` - Color principal de la marca
- **Azul Oscuro**: `#115293` - Color de hover y estados activos
- **Teal Acento**: `#26A69A` - Color de éxito y estados positivos
- **Fondo de Marca**: `#F5F7FB` - Color de fondo de la aplicación
- **Gris Claro**: `#90A4AE` - Color de texto secundario
- **Rojo Alerta**: `#EF5350` - Color de error y morosidad

### Tipografía
- **Fuente Principal**: Inter (Google Fonts)
- **Jerarquía**: Sistema de tipografía consistente con Tailwind CSS

## 📁 Estructura del Proyecto

```
fraccional-v2-kk/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Estilos globales + variables CSS
│   │   ├── layout.tsx          # Layout raíz de la aplicación
│   │   ├── page.tsx            # Página de inicio
│   │   ├── landing/            # Página de aterrizaje
│   │   ├── auth/               # Rutas de autenticación
│   │   └── dashboard/          # Panel de administración
│   ├── components/
│   │   ├── ui/                 # Componentes shadcn/ui
│   │   ├── layout/             # Componentes de layout
│   │   └── forms/              # Componentes de formularios
│   ├── lib/
│   │   ├── utils.ts            # Utilidades generales
│   │   ├── supabase.ts         # Cliente de Supabase
│   │   └── prisma.ts           # Cliente de Prisma
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # Definiciones de tipos TypeScript
│   └── utils/                  # Utilidades específicas
├── public/                     # Archivos estáticos
├── supabase/
│   └── migrations/             # Migraciones de base de datos
├── package.json                # Dependencias del proyecto
├── tailwind.config.js          # Configuración de Tailwind
├── tsconfig.json               # Configuración de TypeScript
├── next.config.js              # Configuración de Next.js
└── .env.example                # Variables de entorno ejemplo
```

## 🗄️ Modelo de Base de Datos

### Tablas Principales

#### Usuarios y Autenticación
- `usuarios` - Perfiles de usuario
- `roles` - Roles del sistema (ADMIN_CONDOMINIO, DUENO, HABITANTE, etc.)
- `usuarios_roles_fraccionamiento` - Relación usuario-rol-fraccionamiento

#### Condominio y Propiedades
- `fraccionamientos` - Información de fraccionamientos/condominios
- `casas` - Casas/unidades individuales
- `propietarios_casas` - Relación propietario-casa
- `habitantes_casas` - Relación habitante-casa

#### Gestión Financiera
- `cargos` - Cuotas, multas, recargos
- `pagos` - Registros de pago de residents
- `pagos_condominio` - Pagos de suscripción SaaS
- `condominios_suscripciones` - Suscripciones de condominios

#### Comunicación y Documentos
- `avisos` - Anuncios y comunicados
- `documentos` - Documentos compartidos
- `incidencias` - Reportes de incidencias
- `incidencias_comentarios` - Comentarios en incidencias

#### Configuración de Landing
- `landing_config` - Configuración de la página de aterrizaje
- `landing_secciones` - Secciones de contenido
- `landing_paquetes_detalle` - Detalles de paquetes de precios

## 🔐 Sistema de Roles

### ADMIN_CONDOMINIO (AC)
- **Cliente principal** - Puede registrarse directamente
- **Gestión completa** de su fraccionamiento
- **Invitaciones** a propietarios y residents
- **Aprobación** de pagos y gestión de morosidad

### DUENO (Propietario)
- **Acceso por invitación** únicamente
- **Visualización** de información de su propiedad
- **Registro de pagos** con comprobantes
- **Invitación de residents** de su casa

### HABITANTE (Residente)
- **Acceso por invitación** del propietario
- **Reportes de incidencias**
- **Visualización** de avisos y documentos

### ADMIN_GENERAL (AG)
- **Administrador de la plataforma**
- **Gestión de pagos SaaS**
- **Supervisión** de todos los fraccionamientos

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase

### 1. Clonar e Instalar Dependencias
```bash
git clone <repository-url>
cd fraccional-v2-kk
npm install
```

### 2. Configurar Supabase
1. Crear un proyecto en [Supabase](https://supabase.com)
2. Obtener las credenciales del proyecto
3. Copiar `.env.example` a `.env.local`
4. Configurar las variables de entorno:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
DATABASE_URL=tu_database_url
```

### 3. Aplicar Migraciones
```bash
# Aplicar migraciones en orden
supabase db push --db-url "$DATABASE_URL"
```

### 4. Ejecutar en Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📋 Estado del Proyecto

### ✅ Completado
- [x] **Fase 1**: Configuración del proyecto y estructura básica
- [x] Diseño y branding con paleta de colores Fraccional
- [x] Landing page responsive con Tailwind CSS
- [x] Estructura de carpetas y archivos base
- [x] Configuración de TypeScript y Tailwind
- [x] Componentes UI básicos (Button, Card)
- [x] **Fase 2**: Base de datos completa y Supabase configurado
  - [x] Esquema de base de datos con 19+ tablas
  - [x] Migraciones aplicadas exitosamente
  - [x] Prisma ORM configurado y funcional
  - [x] Sistema de autenticación básico implementado
  - [x] Flujo de onboarding para ADMIN_CONDOMINIO
  - [x] Dashboard administrativo funcional
- [x] **Fase 4**: Sistema de autenticación avanzado ✅
  - [x] Sistema de recuperación de contraseña
  - [x] Verificación de email implementada
  - [x] Middleware de seguridad y protección de rutas
  - [x] Gestión de perfiles de usuario
  - [x] Gestión de sesiones mejorada
  - [x] Componentes de rutas protegidas
  - [x] Framework de pruebas completo
  - [x] Sistema listo para producción

### 🔄 En Progreso
- [ ] **Fase 5**: Mejoras en landing page y optimización UX
- [ ] **Fase 6**: Gestión de condominios y propiedades
- [ ] **Fase 7**: Sistema de cargos y pagos

### 📅 Próximas Fases
- [ ] **Fase 8-14**: Desarrollo completo de funcionalidades
- [ ] Gestión de incidencias
- [ ] Comunicación y documentos
- [ ] Reportes y analíticas

## 🎯 Próximos Pasos Inmediatos

1. **✅ Configurado Supabase**: Proyecto creado y migraciones aplicadas
2. **✅ Dependencias resueltas**: Aplicación corriendo correctamente
3. **✅ Landing page funcional**: Implementada en Next.js
4. **🔄 Autenticación avanzada**: Mejorar sistema de auth y sesiones
5. **🔄 Onboarding completo**: Finalizar flujo de configuración inicial
6. **Dashboard avanzado**: Expandir funcionalidades del panel administrativo

## 🤝 Contribución

Este proyecto sigue las mejores prácticas de desarrollo:

- **TypeScript** para type safety
- **ESLint + Prettier** para code quality
- **Conventional Commits** para historial claro
- **Git Flow** para gestión de branches
- **Pull Requests** para code review

## 📞 Soporte

Para preguntas sobre el desarrollo o implementación:

- **Documentación técnica**: Ver `FRACCIONAL_DEVELOPMENT_STRATEGY.md`
- **Especificaciones**: Ver `Especificaciones.md`
- **Base de datos**: Ver archivos SQL en `/supabase/migrations/`

---

**Fraccional** - Revolucionando la gestión de condominios desde 2024 🚀