// Email Verification page
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { verifyEmail, resendEmailVerification } from '@/lib/auth'
import { Building2, Mail, CheckCircle, RefreshCw } from 'lucide-react'

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [resending, setResending] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get token from URL params
    const token = searchParams.get('token')
    const emailFromParams = searchParams.get('email')
    
    if (emailFromParams) {
      setEmail(emailFromParams)
    }

    if (token) {
      handleEmailVerification(token)
    }
  }, [searchParams])

  const handleEmailVerification = async (token: string) => {
    setLoading(true)
    setError('')

    const { error } = await verifyEmail(token)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    
    // Redirect to login after 3 seconds
    setTimeout(() => {
      router.push('/auth/login?message=email-verified-success')
    }, 3000)
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError('No se pudo obtener el correo electrónico')
      return
    }

    setResending(true)
    setError('')

    const { error } = await resendEmailVerification(email)

    if (error) {
      setError(error.message)
      setResending(false)
      return
    }

    setResending(false)
    // Show success message or feedback
  }

  // Show verification in progress
  if (loading) {
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
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-brand-blue-dark">
                Verificando correo...
              </CardTitle>
              <CardDescription>
                Por favor espera mientras verificamos tu dirección de correo
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-primary mx-auto"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show verification success
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
                ¡Correo Verificado!
              </CardTitle>
              <CardDescription>
                Tu dirección de correo ha sido verificada exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Ahora puedes acceder a tu cuenta y comenzar a gestionar tu condominio.
              </p>
              <p className="text-xs text-gray-500">
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
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-brand-blue-dark">
              Verificar Correo Electrónico
            </CardTitle>
            <CardDescription>
              Confirma tu dirección de correo para activar tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> Hemos enviado un enlace de verificación a tu correo electrónico.
              </p>
            </div>

            {email && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                <p className="text-sm text-gray-700">
                  <strong>Enviado a:</strong> {email}
                </p>
              </div>
            )}

            <div className="text-sm text-gray-600 space-y-2">
              <p>1. Revisa tu bandeja de entrada</p>
              <p>2. Haz clic en el enlace de verificación</p>
              <p>3. Serás redirigido automáticamente</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <Button
                onClick={handleResendVerification}
                disabled={resending || !email}
                variant="outline"
                className="w-full"
              >
                {resending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Reenviando...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Reenviar correo de verificación
                  </>
                )}
              </Button>

              <Link href="/auth/login">
                <Button variant="ghost" className="w-full">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>

            <div className="text-xs text-gray-500 text-center pt-2">
              ¿No recibiste el correo? Revisa tu carpeta de spam o solicita un nuevo enlace.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}