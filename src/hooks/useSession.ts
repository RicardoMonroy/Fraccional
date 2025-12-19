// Enhanced Session Management Hook
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSessionWithRefresh, refreshSession, signOut, getCurrentUser } from '@/lib/auth'

interface SessionState {
  session: any | null
  user: any | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export function useSession() {
  const router = useRouter()
  const [state, setState] = useState<SessionState>({
    session: null,
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  })

  // Check session status
  const checkSession = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      const { session } = await getSessionWithRefresh()
      let user = null

      if (session) {
        const { user: currentUser } = await getCurrentUser()
        user = currentUser
      }

      setState({
        session,
        user,
        loading: false,
        error: null,
        isAuthenticated: !!session && !!user
      })

      return { session, user, isAuthenticated: !!session && !!user }
    } catch (error) {
      console.error('Session check failed:', error)
      setState({
        session: null,
        user: null,
        loading: false,
        error: 'Error al verificar la sesión',
        isAuthenticated: false
      })
      return { session: null, user: null, isAuthenticated: false }
    }
  }, [])

  // Refresh session
  const refreshSessionData = useCallback(async () => {
    try {
      const { session } = await refreshSession()
      if (session) {
        const { user } = await getCurrentUser()
        setState(prev => ({
          ...prev,
          session,
          user,
          isAuthenticated: true,
          error: null
        }))
        return { session, user, isAuthenticated: true }
      } else {
        // Session refresh failed, user might be logged out
        setState(prev => ({
          ...prev,
          session: null,
          user: null,
          isAuthenticated: false
        }))
        return { session: null, user: null, isAuthenticated: false }
      }
    } catch (error) {
      console.error('Session refresh failed:', error)
      setState(prev => ({
        ...prev,
        session: null,
        user: null,
        isAuthenticated: false,
        error: 'Error al actualizar la sesión'
      }))
      return { session: null, user: null, isAuthenticated: false }
    }
  }, [])

  // Sign out
  const logout = useCallback(async () => {
    try {
      await signOut()
      setState({
        session: null,
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      })
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      setState(prev => ({
        ...prev,
        error: 'Error al cerrar sesión'
      }))
    }
  }, [router])

  // Initialize session on mount
  useEffect(() => {
    checkSession()
  }, [checkSession])

  // Set up session refresh interval (every 10 minutes)
  useEffect(() => {
    if (state.isAuthenticated) {
      const interval = setInterval(() => {
        refreshSessionData()
      }, 10 * 60 * 1000) // 10 minutes

      return () => clearInterval(interval)
    }
  }, [state.isAuthenticated, refreshSessionData])

  // Set up visibility change listener to refresh session when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && state.isAuthenticated) {
        refreshSessionData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [state.isAuthenticated, refreshSessionData])

  return {
    ...state,
    checkSession,
    refreshSession: refreshSessionData,
    logout,
    reauthenticate: checkSession
  }
}

// Hook for protected pages
export function useRequireAuth(redirectTo: string = '/auth/login') {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session.loading && !session.isAuthenticated) {
      const currentPath = window.location.pathname
      const redirectUrl = new URL(redirectTo, window.location.origin)
      redirectUrl.searchParams.set('redirectTo', currentPath)
      router.push(redirectUrl.toString())
    }
  }, [session.isAuthenticated, session.loading, redirectTo, router])

  return session
}

// Hook for role-based access control
export function useRequireRole(requiredRole: string, redirectTo: string = '/dashboard') {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session.loading) {
      if (!session.isAuthenticated) {
        router.push('/auth/login')
        return
      }

      // Here you would implement role checking logic
      // For now, we'll assume all authenticated users have access
      // In a real implementation, you'd check the user's roles from the database
      console.log('Checking role:', requiredRole, 'for user:', session.user?.email)
    }
  }, [session.isAuthenticated, session.loading, requiredRole, redirectTo, router])

  return session
}