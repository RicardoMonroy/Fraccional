// Onboarding page for ADMIN_CONDOMINIO
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, MapPin, Users, CreditCard } from 'lucide-react'

interface OnboardingData {
  // Step 1: Condominium info
  nombre: string
  direccion: string
  ciudad: string
  estado: string
  codigoPostal: string
  telefono: string
  email: string
  
  // Step 2: Configuration
  numeroCasas: number
  
  // Step 3: Package selection
  paqueteId: number
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState<OnboardingData>({
    nombre: '',
    direccion: '',
    ciudad: '',
    estado: '',
    codigoPostal: '',
    telefono: '',
    email: '',
    numeroCasas: 10,
    paqueteId: 1
  })
  const router = useRouter()

  const handleInputChange = (field: keyof OnboardingData, value: string | number) => {
    setData({
      ...data,
      [field]: value
    })
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/onboarding/create-condominium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Error al crear el condominio')
      }

      const result = await response.json()
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-brand-blue-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-blue-dark">
                Información de tu Condominio
              </h2>
              <p className="text-gray-600">
                Cuéntanos sobre tu fraccionamiento o condominio
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del condominio *
                </label>
                <input
                  type="text"
                  value={data.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                  placeholder="Ej: Condominio Las Flores"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={data.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                  placeholder="Calle y número"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={data.ciudad}
                    onChange={(e) => handleInputChange('ciudad', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                    placeholder="Ciudad"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <input
                    type="text"
                    value={data.estado}
                    onChange={(e) => handleInputChange('estado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                    placeholder="Estado"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código postal
                  </label>
                  <input
                    type="text"
                    value={data.codigoPostal}
                    onChange={(e) => handleInputChange('codigoPostal', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                    placeholder="CP"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={data.telefono}
                    onChange={(e) => handleInputChange('telefono', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                    placeholder="Teléfono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de contacto
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                  placeholder="contacto@condominio.com"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Users className="h-12 w-12 text-brand-blue-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-blue-dark">
                Configuración de Casas
              </h2>
              <p className="text-gray-600">
                ¿Cuántas casas tiene tu condominio?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de casas *
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={data.numeroCasas}
                  onChange={(e) => handleInputChange('numeroCasas', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esto nos ayudará a recomendarte el mejor plan
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">¿Necesitas ayuda con la numeración?</h4>
                <p className="text-sm text-blue-700">
                  El sistema generará automáticamente las casas numeradas del 1 al {data.numeroCasas}. 
                  Podrás personalizar los números más adelante.
                </p>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <CreditCard className="h-12 w-12 text-brand-blue-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-brand-blue-dark">
                Selecciona tu Plan
              </h2>
              <p className="text-gray-600">
                Basado en {data.numeroCasas} casas, te recomendamos:
              </p>
            </div>

            <div className="space-y-4">
              {data.numeroCasas <= 20 && (
                <div className="border-2 border-brand-blue-primary rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-brand-blue-dark">Plan Básico</h3>
                    <span className="text-2xl font-bold text-brand-blue-primary">$299/mes</span>
                  </div>
                  <p className="text-gray-600 mb-3">Perfecto para condominios pequeños</p>
                  <ul className="text-sm space-y-1">
                    <li>• Hasta 20 casas</li>
                    <li>• Gestión básica de pagos</li>
                    <li>• Avisos y documentos</li>
                    <li>• Soporte por email</li>
                  </ul>
                </div>
              )}

              {data.numeroCasas > 20 && data.numeroCasas <= 50 && (
                <div className="border-2 border-brand-blue-primary rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-brand-blue-dark">Plan Profesional</h3>
                    <span className="text-2xl font-bold text-brand-blue-primary">$599/mes</span>
                  </div>
                  <p className="text-gray-600 mb-3">Ideal para condominios medianos</p>
                  <ul className="text-sm space-y-1">
                    <li>• Hasta 50 casas</li>
                    <li>• Gestión completa de pagos</li>
                    <li>• Reportes avanzados</li>
                    <li>• Gestión de incidencias</li>
                    <li>• Soporte prioritario</li>
                  </ul>
                </div>
              )}

              {data.numeroCasas > 50 && (
                <div className="border-2 border-brand-blue-primary rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-brand-blue-dark">Plan Enterprise</h3>
                    <span className="text-2xl font-bold text-brand-blue-primary">$999/mes</span>
                  </div>
                  <p className="text-gray-600 mb-3">Para grandes fraccionamientos</p>
                  <ul className="text-sm space-y-1">
                    <li>• Casas ilimitadas</li>
                    <li>• Funcionalidades completas</li>
                    <li>• API personalizada</li>
                    <li>• Soporte dedicado</li>
                    <li>• Capacitación incluida</li>
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-600">
                  <strong>Nota:</strong> Podrás cambiar de plan más adelante según tus necesidades.
                  El primer mes es gratuito para que pruebes todas las funcionalidades.
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return data.nombre && data.direccion && data.ciudad && data.estado
      case 2:
        return data.numeroCasas > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-brand-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building2 className="h-8 w-8 text-brand-blue-primary" />
            <span className="text-2xl font-bold text-brand-blue-dark">Fraccional</span>
          </div>
          <h1 className="text-3xl font-bold text-brand-blue-dark mb-2">
            Configuración de tu Condominio
          </h1>
          <p className="text-gray-600">
            Paso {currentStep} de 3 - {currentStep === 1 ? 'Información básica' : currentStep === 2 ? 'Configuración' : 'Plan de suscripción'}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex space-x-4">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-brand-blue-primary text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            {renderStep()}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mt-4">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid()}
                  className="bg-brand-blue-primary hover:bg-brand-blue-dark"
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid() || loading}
                  className="bg-brand-blue-primary hover:bg-brand-blue-dark"
                >
                  {loading ? 'Creando condominio...' : 'Finalizar Configuración'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}