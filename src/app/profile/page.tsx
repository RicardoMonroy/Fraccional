// User Profile Management page
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, getUserProfile, updateProfile, changePassword } from '@/lib/auth'
import { User, Mail, Phone, Lock, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  id: string
  email: string
  nombre?: string
  telefono?: string
  activo: boolean
  email_verified?: boolean
  created_at?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    nombre: '',
    telefono: ''
  })
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { user: authUser } = await getCurrentUser()
      if (!authUser) {
        router.push('/auth/login')
        return
      }

      const { data: userProfile } = await getUserProfile(authUser.id)
      
      setUser(authUser)
      setProfile(userProfile)
      setProfileForm({
        nombre: userProfile?.nombre || '',
        telefono: userProfile?.telefono || ''
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Error al cargar los datos del usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      const { error } = await updateProfile(user!.id, profileForm)
      
      if (error) {
        setError(error.message)
        return
      }

      setMessage('Perfil actualizado exitosamente')
      await loadUserData() // Reload to get updated data
    } catch (error) {
      setError('Error al actualizar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setSaving(false)
      return
    }

    // Validate password strength
    if (passwordForm.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres')
      setSaving(false)
      return
    }

    try {
      const { error } = await changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      )
      
      if (error) {
        setError(error.message)
        return
      }

      setMessage('Contraseña actualizada exitosamente')
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      setError('Error al cambiar la contraseña')
    } finally {
      setSaving(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-brand-blue-primary hover:text-brand-blue-dark mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver al dashboard
          </Link>
          <h1 className="text-3xl font-bold text-brand-blue-dark">Mi Perfil</h1>
          <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración de seguridad</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-brand-blue-primary text-brand-blue-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline mr-2" />
                Información Personal
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-brand-blue-primary text-brand-blue-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Lock className="h-4 w-4 inline mr-2" />
                Seguridad
              </button>
            </nav>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualiza tu información personal y de contacto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      />
                      <Mail className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">El correo electrónico no se puede modificar</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                      Nombre completo
                    </label>
                    <input
                      id="nombre"
                      type="text"
                      value={profileForm.nombre}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="telefono" className="text-sm font-medium text-gray-700">
                      Teléfono
                    </label>
                    <div className="relative">
                      <input
                        id="telefono"
                        type="tel"
                        value={profileForm.telefono}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, telefono: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                        placeholder="Tu número de teléfono"
                      />
                      <Phone className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Estado de la cuenta
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile?.activo 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile?.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-brand-blue-primary hover:bg-brand-blue-dark"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>
                Cambia tu contraseña y gestiona la seguridad de tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                      Contraseña actual
                    </label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                        placeholder="Tu contraseña actual"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('current')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.current ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                      Nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('new')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.new ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                      Confirmar nueva contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue-primary"
                        placeholder="Repite tu nueva contraseña"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('confirm')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPasswords.confirm ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Consejos de seguridad:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Usa una contraseña de al menos 6 caracteres</li>
                    <li>• Combina letras, números y símbolos</li>
                    <li>• No uses información personal obvia</li>
                    <li>• Cambia tu contraseña regularmente</li>
                  </ul>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="bg-brand-blue-primary hover:bg-brand-blue-dark"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {saving ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}