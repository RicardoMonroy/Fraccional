// Protected Route Component
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionWithRefresh, getCurrentUser } from '@/lib/auth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'ADMIN_CONDOMINIO' | 'ADMIN_SISTEMA'
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAuthorization()
  }, [])

  const checkAuthorization = async () => {
    try {
      // Check if user has a valid session
      const { session } = await getSessionWithRefresh()
      
      if (!session) {
        router.push(redirectTo)
        return
      }

      // If a specific role is required, check for it
      if (requiredRole) {
        const { user } = await getCurrentUser()
        
        // You would implement role checking here based on your requirements
        // For now, we'll assume all authenticated users have access
        // In a real implementation, you'd check the user's roles in the database
        
        if (requiredRole === 'ADMIN_CONDOMINIO') {
          // Check if user has admin condominium role
          // This would require a separate API call to check user roles
          console.log('Checking admin condominium role...')
        }
      }

      setAuthorized(true)
    } catch (error) {
      console.error('Authorization check failed:', error)
      router.push(redirectTo)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-blue-primary mx-auto" />
          <p className="mt-4 text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  if (!authorized) {
    return null // Will redirect
  }

  return <>{children}</>
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}