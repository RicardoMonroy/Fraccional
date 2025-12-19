// Forgot Password page
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { requestPasswordReset } from '@/lib/auth'
import { Building2, ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await requestPasswordReset(email)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
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
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-green-600">
                ¡Correo Enviado!
              </CardTitle>
              <CardDescription>
                Hemos enviado un enlace de recuperación a tu correo electrónico
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </p>
              <p className="text-xs text-gray-500">
                Si no ves el correo, revisa tu carpeta de spam.
              </p>
              
              <div className="pt-4">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
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
              Recuperar Contraseña
            </CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico para recibir un enlace de recuperación
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
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
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