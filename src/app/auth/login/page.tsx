// Enhanced Login page with Phase 4 features
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signIn, getCurrentUser, supabase } from '@/lib/auth'
import { Building2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Handle success messages from URL params
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      console.log('Message:', message)
    }
  }, [searchParams])

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
        return { hasAdminGeneral: false, hasAdminCondominio: false }
      }

      const hasAdminGeneral = userRoles?.some((role: any) => role.roles.nombre === 'ADMIN_GENERAL') || false
      const hasAdminCondominio = userRoles?.some((role: any) => role.roles.nombre === 'ADMIN_CONDOMINIO') || false

      console.log('User roles check:', {
        userId,
        roles: userRoles?.map((r: any) => r.roles.nombre),
        hasAdminGeneral,
        hasAdminCondominio
      })

      return { hasAdminGeneral, hasAdminCondominio }
    } catch (err) {
      console.error('Error checking user roles:', err)
      return { hasAdminGeneral: false, hasAdminCondominio: false }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await signIn(email, password)

      if (error) {
        console.error('SignIn error:', error)
        setError(error.message || 'Error al iniciar sesión')
        setLoading(false)
        return
      }

      if (!data?.session) {
        setError('No se pudo establecer la sesión')
        setLoading(false)
        return
      }

      console.log('Login successful, session:', data.session)

      // Check user roles after successful login
      const { user, error: userError } = await getCurrentUser()
      if (userError) {
        console.error('Error getting current user:', userError)
      }

      if (user) {
        const { hasAdminGeneral, hasAdminCondominio } = await checkUserRoles(user.id)

        // Determine redirect based on roles
        if (hasAdminGeneral || hasAdminCondominio) {
          // Admin users go to dashboard with login bypass
          console.log('Admin user - redirecting to dashboard with bypass')
          
          const dashboardUrl = new URL('/dashboard', window.location.origin)
          dashboardUrl.searchParams.set('from', 'login')
          
          window.location.href = dashboardUrl.toString()
        } else {
          // Other users go to onboarding
          console.log('Regular user - redirecting to onboarding')
          router.push('/onboarding')
        }
      } else {
        // Fallback to onboarding if user check fails
        console.log('No user data - redirecting to onboarding')
        router.push('/onboarding')
      }

    } catch (err) {
      console.error('Unexpected error during login:', err)
      setError('Error inesperado durante el inicio de sesión')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 text-brand-blue-primary hover:text-brand-blue-dark">
            <Building2 className="h-8 w-8" />
            <span className="text-2xl font-bold">Fraccional</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-brand-blue-dark">
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Accede a tu cuenta de administrador de condominio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                  placeholder="tu@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                    placeholder="Tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm flex items-start">
                  <AlertCircle className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-brand-blue-primary hover:bg-brand-blue-dark"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              {/* Forgot Password Link */}
              <div className="text-center">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-sm text-brand-blue-primary hover:text-brand-blue-dark hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">¿Nuevo en Fraccional?</span>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <Link href="/auth/signup" className="text-brand-blue-primary hover:text-brand-blue-dark font-medium hover:underline">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Conexión segura</p>
                  <p>Tu información está protegida con encriptación de extremo a extremo.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}