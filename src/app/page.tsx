import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, DollarSign, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-brand-blue-primary" />
            <h1 className="text-2xl font-bold text-brand-blue-dark">Fraccional</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-brand-blue-primary">
              Características
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-brand-blue-primary">
              Precios
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-brand-blue-primary">
              Contacto
            </Link>
          </nav>
          <div className="flex space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-brand-blue-primary hover:bg-brand-blue-dark">
                Comenzar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold text-brand-blue-dark mb-6">
            Gestión Simplificada de
            <span className="text-brand-blue-primary block">Condominios y Fraccionamientos</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            La plataforma SaaS que revoluciona la administración de condominios. 
            Gestiona propiedades, residents, pagos y comunicaciones en un solo lugar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-brand-blue-primary hover:bg-brand-blue-dark">
                Comenzar como Administrador
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline">
                Ver Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-brand-blue-dark mb-12">
            Todo lo que necesitas para gestionar tu condominio
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Building2 className="h-12 w-12 text-brand-blue-primary mx-auto mb-4" />
                <CardTitle>Gestión de Propiedades</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Administra casas, propietarios y residents de manera eficiente
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-brand-teal-accent mx-auto mb-4" />
                <CardTitle>Control Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gestiona cuotas, pagos y reportes financieros en tiempo real
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-brand-blue-primary mx-auto mb-4" />
                <CardTitle>Comunicación</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Publica avisos, documentos y mantén comunicación constante
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-brand-teal-accent mx-auto mb-4" />
                <CardTitle>Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Registra y gestiona incidencias de manera organizada
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-brand-blue-dark mb-12">
            Planes diseñados para tu condominio
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle>Básico</CardTitle>
                <CardDescription>Para condominios pequeños</CardDescription>
                <div className="text-3xl font-bold text-brand-blue-primary">$299<span className="text-lg">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2">
                  <li>• Hasta 20 casas</li>
                  <li>• Gestión básica de pagos</li>
                  <li>• Avisos y documentos</li>
                  <li>• Soporte por email</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative border-brand-blue-primary">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-blue-primary text-white px-3 py-1 rounded-full text-sm">Popular</span>
              </div>
              <CardHeader>
                <CardTitle>Profesional</CardTitle>
                <CardDescription>Para condominios medianos</CardDescription>
                <div className="text-3xl font-bold text-brand-blue-primary">$599<span className="text-lg">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2">
                  <li>• Hasta 50 casas</li>
                  <li>• Gestión completa de pagos</li>
                  <li>• Reportes avanzados</li>
                  <li>• Gestión de incidencias</li>
                  <li>• Soporte prioritario</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative">
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Para grandes fraccionamientos</CardDescription>
                <div className="text-3xl font-bold text-brand-blue-primary">$999<span className="text-lg">/mes</span></div>
              </CardHeader>
              <CardContent>
                <ul className="text-left space-y-2">
                  <li>• Casas ilimitadas</li>
                  <li>• Funcionalidades completas</li>
                  <li>• API personalizada</li>
                  <li>• Soporte dedicado</li>
                  <li>• Capacitación incluida</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-brand-blue-primary text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">
            ¿Listo para revolucionar la gestión de tu condominio?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a cientos de administradores que ya confían en Fraccional
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="bg-white text-brand-blue-primary hover:bg-gray-100">
              Comenzar Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="text-xl font-bold">Fraccional</span>
              </div>
              <p className="text-gray-400">
                La plataforma líder en gestión de condominios y fraccionamientos.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features">Características</Link></li>
                <li><Link href="#pricing">Precios</Link></li>
                <li><Link href="#demo">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#about">Acerca de</Link></li>
                <li><Link href="#contact">Contacto</Link></li>
                <li><Link href="#blog">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#help">Ayuda</Link></li>
                <li><Link href="#docs">Documentación</Link></li>
                <li><Link href="#status">Estado del servicio</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Fraccional. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}