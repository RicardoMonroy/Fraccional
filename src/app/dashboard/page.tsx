// Dashboard page with role-based access
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Users, DollarSign, AlertCircle, LogOut, Plus, Crown } from 'lucide-react'
import { getCurrentUser, signOut, supabase } from '@/lib/auth'

interface DashboardStats {
  totalCasas: number
  casasOcupadas: number
  cuotasPendientes: number
  incidenciasAbiertas: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [checkingRole, setCheckingRole] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalCasas: 0,
    casasOcupadas: 0,
    cuotasPendientes: 0,
    incidenciasAbiertas: 0
  })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle login bypass parameter
    const fromLogin = searchParams.get('from') === 'login'
    if (fromLogin) {
      console.log('Dashboard accessed via login bypass')
      // Remove the from=login parameter from URL
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('from')
      window.history.replaceState({}, '', newUrl.toString())
    }
    
    initializeUser()
  }, [])

  const checkUserRoles = async (userId: string) => {
    try {
      const { data: userRoles, error } = await supabase
        .from('usuarios_roles_fraccionamiento')
        .select(`
          rol_id,
          roles!inner(
            nombre,
            nivel_permisos
          )
        `)
        .eq('usuario_id', userId)
        .eq('acceso_habilitado', true)

      if (error) {
        console.error('Error checking user roles:', error)
        return { hasAdminGeneral: false, hasAdminCondominio: false, role: null }
      }

      const hasAdminGeneral = userRoles?.some((role: any) => role.roles.nombre === 'ADMIN_GENERAL') || false
      const hasAdminCondominio = userRoles?.some((role: any) => role.roles.nombre === 'ADMIN_CONDOMINIO') || false

      let role = null
      if (hasAdminGeneral) {
        role = 'ADMIN_GENERAL'
      } else if (hasAdminCondominio) {
        role = 'ADMIN_CONDOMINIO'
      }

      console.log('Dashboard role check:', {
        userId,
        roles: userRoles?.map((r: any) => r.roles.nombre),
        hasAdminGeneral,
        hasAdminCondominio,
        determinedRole: role
      })

      return { hasAdminGeneral, hasAdminCondominio, role }
    } catch (err) {
      console.error('Error checking user roles:', err)
      return { hasAdminGeneral: false, hasAdminCondominio: false, role: null }
    }
  }

  const initializeUser = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (error || !user) {
        console.error('Error loading user:', error)
        router.push('/auth/login')
        return
      }

      setUser(user)

      // Check user roles
      const { hasAdminGeneral, hasAdminCondominio, role } = await checkUserRoles(user.id)
      
      if (!hasAdminGeneral && !hasAdminCondominio) {
        // User doesn't have admin roles, redirect to onboarding
        console.log('User has no admin roles, redirecting to onboarding')
        router.push('/onboarding')
        return
      }

      setUserRole(role || '')
      
      // Load dashboard statistics
      await loadDashboardStats()
    } catch (error) {
      console.error('Error:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
      setCheckingRole(false)
    }
  }

  const loadDashboardStats = async () => {
    // This would typically fetch from the API
    // For now, we'll use mock data
    setStats({
      totalCasas: 25,
      casasOcupadas: 23,
      cuotasPendientes: 5,
      incidenciasAbiertas: 2
    })
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-brand-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-brand-blue-primary" />
            <h1 className="text-2xl font-bold text-brand-blue-dark">Fraccional</h1>
            {userRole === 'ADMIN_GENERAL' && (
              <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                <Crown className="h-3 w-3" />
                <span>ADMIN GENERAL</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">
              Bienvenido, {user?.user_metadata?.nombre || user?.email}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar Sesión</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-brand-blue-dark mb-2">
            {userRole === 'ADMIN_GENERAL' ? 'Panel de Administrador General' : 'Panel de Administración'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'ADMIN_GENERAL' 
              ? 'Gestiona el sistema completo y usuarios del platform' 
              : 'Gestiona tu condominio de manera eficiente'
            }
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {userRole === 'ADMIN_GENERAL' ? (
            // Admin General Actions
            <>
              <Button className="h-20 flex-col space-y-2 bg-yellow-600 hover:bg-yellow-700">
                <Users className="h-6 w-6" />
                <span>Gestionar Usuarios</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Building2 className="h-6 w-6" />
                <span>Todos los Condominios</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <DollarSign className="h-6 w-6" />
                <span>Reportes Globales</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <AlertCircle className="h-6 w-6" />
                <span>Soporte</span>
              </Button>
            </>
          ) : (
            // Admin Condominio Actions
            <>
              <Button className="h-20 flex-col space-y-2 bg-brand-blue-primary hover:bg-brand-blue-dark">
                <Plus className="h-6 w-6" />
                <span>Agregar Casa</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <DollarSign className="h-6 w-6" />
                <span>Crear Cargo</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <Users className="h-6 w-6" />
                <span>Invitar Propietario</span>
              </Button>
              
              <Button variant="outline" className="h-20 flex-col space-y-2">
                <AlertCircle className="h-6 w-6" />
                <span>Reportar Incidencia</span>
              </Button>
            </>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Casas</CardTitle>
              <Building2 className="h-4 w-4 text-brand-blue-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCasas}</div>
              <p className="text-xs text-gray-600">
                {stats.casasOcupadas} ocupadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuotas Pendientes</CardTitle>
              <DollarSign className="h-4 w-4 text-brand-teal-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cuotasPendientes}</div>
              <p className="text-xs text-gray-600">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incidencias Abiertas</CardTitle>
              <AlertCircle className="h-4 w-4 text-brand-red-alert" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.incidenciasAbiertas}</div>
              <p className="text-xs text-gray-600">
                En proceso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado del Servicio</CardTitle>
              <div className="h-4 w-4 rounded-full bg-green-500"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Activo</div>
              <p className="text-xs text-gray-600">
                Servicio normal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas acciones en tu condominio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-brand-blue-primary rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Nueva casa agregada</p>
                    <p className="text-xs text-gray-600">Casa #26 creada</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-brand-teal-accent rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Pago aprobado</p>
                    <p className="text-xs text-gray-600">Casa #15 - Cuota enero</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-brand-red-alert rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Nueva incidencia</p>
                    <p className="text-xs text-gray-600">Fuga de agua - Casa #8</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximos Vencimientos</CardTitle>
              <CardDescription>
                Pagos y tareas pendientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Cuota ordinaria febrero</p>
                    <p className="text-xs text-gray-600">15 casas</p>
                  </div>
                  <span className="text-sm font-medium text-brand-blue-primary">
                    28 Feb
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Pago de suscripción</p>
                    <p className="text-xs text-gray-600">Plan Profesional</p>
                  </div>
                  <span className="text-sm font-medium text-brand-blue-primary">
                    5 Mar
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Reunión de condominio</p>
                    <p className="text-xs text-gray-600">Asamblea general</p>
                  </div>
                  <span className="text-sm font-medium text-brand-blue-primary">
                    10 Mar
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}