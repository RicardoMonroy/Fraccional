// Enhanced Authentication utilities for Phase 4
import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  nombre?: string
  telefono?: string
  activo: boolean
  email_verified?: boolean
  created_at?: string
  updated_at?: string
}

export interface AuthError {
  message: string
}

export interface ProfileUpdateData {
  nombre?: string
  telefono?: string
}

export interface PasswordResetData {
  email: string
}

// Sign up new user
export const signUp = async (email: string, password: string, nombre?: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre || ''
        }
      }
    })

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Sign in user
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Sign out user
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    return { error: null }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// Get current session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    
    return { session, error: null }
  } catch (error) {
    return { session: null, error: error as AuthError }
  }
}

// Get current user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    
    return { user, error: null }
  } catch (error) {
    return { user: null, error: error as AuthError }
  }
}

// Check if user has admin condominium role
export const checkAdminCondominioRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios_roles_fraccionamiento')
      .select(`
        *,
        roles!inner(
          nombre
        )
      `)
      .eq('usuario_id', userId)
      .eq('roles.nombre', 'ADMIN_CONDOMINIO')
      .eq('acceso_habilitado', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows returned
    
    return { hasRole: !!data, error: null }
  } catch (error) {
    return { hasRole: false, error: error as AuthError }
  }
}

// ===== PHASE 4: ENHANCED AUTHENTICATION FEATURES =====

// Request password reset
export const requestPasswordReset = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Reset password with new password
export const resetPassword = async (password: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Update user profile
export const updateProfile = async (userId: string, profileData: ProfileUpdateData) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Verify email
export const verifyEmail = async (token: string) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    })

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Resend email verification
export const resendEmailVerification = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Enhanced session management
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) throw error
    
    return { session: data.session, error: null }
  } catch (error) {
    return { session: null, error: error as AuthError }
  }
}

// Check if session is expired
export const isSessionExpired = (session: any) => {
  if (!session?.expires_at) return true
  
  const now = Math.floor(Date.now() / 1000)
  return session.expires_at <= now
}

// Get session with auto-refresh
export const getSessionWithRefresh = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    let session = data.session
    
    // Check if session is expired and refresh if needed
    if (session && isSessionExpired(session)) {
      const refreshResult = await refreshSession()
      if (!refreshResult.error) {
        session = refreshResult.session
      } else {
        // Refresh failed, return null session
        session = null
      }
    }
    
    return { session, error: null }
  } catch (error) {
    return { session: null, error: error as AuthError }
  }
}

// Change password for logged in user
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    // First verify current password by attempting to sign in
    const { user } = await getCurrentUser()
    if (!user?.email) throw new Error('Usuario no autenticado')

    const { error: signInError } = await signIn(user.email, currentPassword)
    if (signInError) throw new Error('Contraseña actual incorrecta')

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Delete user account
export const deleteAccount = async (userId: string) => {
  try {
    // Note: This requires service role key and should be done server-side
    // For now, we'll just mark the user as inactive
    const { data, error } = await supabase
      .from('usuarios')
      .update({ activo: false })
      .eq('id', userId)

    if (error) throw error
    
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as AuthError }
  }
}

// Export supabase client for use in components
export { supabase }