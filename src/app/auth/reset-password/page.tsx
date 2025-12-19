// Reset Password page
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPassword } from '@/lib/auth'
import { Building2, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState<boolean | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if we have a valid session (this would be handled by Supabase automatically)
    // For now, we'll assume the session is valid if we have the search params
    setValidSession(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    const { error } = await resetPassword(password)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/auth/login?message=password-reset-success')
    }, 3000)
  }

  // Show loading while checking session
  if (validSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando enlace de recuperación...</p>
        </div>
      </div>
    )
  }

  // Show invalid session message
  if (validSession === false) {
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
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <ArrowLeft className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Enlace Inválido
              </CardTitle>
              <CardDescription>
                Este enlace de recuperación ha expirado o no es válido
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Solicita un nuevo enlace de recuperación para restablecer tu contraseña.
              </p>
              
              <div className="pt-4 space-y-2">
                <Link href="/auth/forgot-password">
                  <Button className="w-full bg-brand-blue-primary hover:bg-brand-blue-dark">
                    Solicitar Nuevo Enlace
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
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
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                ¡Contraseña Actualizada!
              </CardTitle>
              <CardDescription>
                Tu contraseña ha sido restablecida exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Serás redirigido al inicio de sesión en unos segundos.
              </p>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue-primary mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
              Nueva Contraseña
            </CardTitle>
            <CardDescription>
              Ingresa tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                    placeholder="Mínimo 6 caracteres"
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

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                    placeholder="Repite tu contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-brand-blue-primary hover:bg-brand-blue-dark"
                disabled={loading}
              >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/auth/login" className="inline-flex items-center text-sm text-brand-blue-primary hover:text-brand-blue-dark">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}