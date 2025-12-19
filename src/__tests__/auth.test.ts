// Comprehensive Authentication Tests for Phase 4
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  signUp, 
  signIn, 
  signOut, 
  requestPasswordReset, 
  resetPassword,
  updateProfile,
  getUserProfile,
  verifyEmail,
  resendEmailVerification,
  getSessionWithRefresh,
  changePassword,
  isSessionExpired
} from '@/lib/auth'

// Mock Supabase client
const mockSupabase = {
  auth: {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    getUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    verifyOtp: vi.fn(),
    resend: vi.fn(),
    refreshSession: vi.fn()
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        }))
      }))
    }))
  }))
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    origin: 'https://localhost:3000'
  },
  writable: true
})

// Mock the supabase module
vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase
}))

describe('Authentication Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signUp', () => {
    it('should successfully sign up a new user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await signUp('test@example.com', 'password123', 'Test User')

      expect(result.data).toEqual({ user: mockUser })
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            nombre: 'Test User'
          }
        }
      })
    })

    it('should handle sign up errors', async () => {
      const mockError = { message: 'Email already exists' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await signUp('test@example.com', 'password123')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signIn', () => {
    it('should successfully sign in a user', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockSession = { access_token: 'token123' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null
      })

      const result = await signIn('test@example.com', 'password123')

      expect(result.data).toEqual({ user: mockUser, session: mockSession })
      expect(result.error).toBeNull()
    })

    it('should handle sign in errors', async () => {
      const mockError = { message: 'Invalid credentials' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await signIn('test@example.com', 'wrongpassword')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('signOut', () => {
    it('should successfully sign out a user', async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null
      })

      const result = await signOut()

      expect(result.error).toBeNull()
      expect(mockSupabase.auth.signOut).toHaveBeenCalled()
    })

    it('should handle sign out errors', async () => {
      const mockError = { message: 'Sign out failed' }
      mockSupabase.auth.signOut.mockResolvedValue({
        error: mockError
      })

      const result = await signOut()

      expect(result.error).toEqual(mockError)
    })
  })

  describe('requestPasswordReset', () => {
    it('should successfully request password reset', async () => {
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: { message: 'Reset email sent' },
        error: null
      })

      const result = await requestPasswordReset('test@example.com')

      expect(result.data).toEqual({ message: 'Reset email sent' })
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        {
          redirectTo: 'https://localhost:3000/auth/reset-password'
        }
      )
    })

    it('should handle password reset request errors', async () => {
      const mockError = { message: 'User not found' }
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await requestPasswordReset('nonexistent@example.com')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('resetPassword', () => {
    it('should successfully reset password', async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: { id: '123' } },
        error: null
      })

      const result = await resetPassword('newpassword123')

      expect(result.data).toEqual({ user: { id: '123' } })
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      })
    })

    it('should handle password reset errors', async () => {
      const mockError = { message: 'Password update failed' }
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await resetPassword('weak')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const mockProfile = { id: '123', nombre: 'Updated Name', telefono: '123456789' }
      const mockQuery = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null
              })
            })
          })
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await updateProfile('123', { nombre: 'Updated Name', telefono: '123456789' })

      expect(result.data).toEqual(mockProfile)
      expect(result.error).toBeNull()
      expect(mockQuery.update).toHaveBeenCalledWith({
        nombre: 'Updated Name',
        telefono: '123456789'
      })
    })

    it('should handle profile update errors', async () => {
      const mockError = { message: 'Profile update failed' }
      const mockQuery = {
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: mockError
              })
            })
          })
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await updateProfile('123', { nombre: 'Test' })

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('getUserProfile', () => {
    it('should successfully get user profile', async () => {
      const mockProfile = { id: '123', email: 'test@example.com', nombre: 'Test User' }
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProfile,
              error: null
            })
          })
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await getUserProfile('123')

      expect(result.data).toEqual(mockProfile)
      expect(result.error).toBeNull()
    })

    it('should handle get profile errors', async () => {
      const mockError = { message: 'Profile not found' }
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)

      const result = await getUserProfile('999')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('verifyEmail', () => {
    it('should successfully verify email', async () => {
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: { id: '123', email_confirmed_at: new Date().toISOString() } },
        error: null
      })

      const result = await verifyEmail('verification-token')

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.verifyOtp).toHaveBeenCalledWith({
        token_hash: 'verification-token',
        type: 'email'
      })
    })

    it('should handle email verification errors', async () => {
      const mockError = { message: 'Invalid verification token' }
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await verifyEmail('invalid-token')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('resendEmailVerification', () => {
    it('should successfully resend email verification', async () => {
      mockSupabase.auth.resend.mockResolvedValue({
        data: { message: 'Verification email sent' },
        error: null
      })

      const result = await resendEmailVerification('test@example.com')

      expect(result.data).toEqual({ message: 'Verification email sent' })
      expect(result.error).toBeNull()
      expect(mockSupabase.auth.resend).toHaveBeenCalledWith({
        type: 'signup',
        email: 'test@example.com'
      })
    })

    it('should handle resend verification errors', async () => {
      const mockError = { message: 'Failed to resend verification' }
      mockSupabase.auth.resend.mockResolvedValue({
        data: null,
        error: mockError
      })

      const result = await resendEmailVerification('test@example.com')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('getSessionWithRefresh', () => {
    it('should return current session when valid', async () => {
      const mockSession = { 
        access_token: 'token123', 
        expires_at: Date.now() / 1000 + 3600 
      }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await getSessionWithRefresh()

      expect(result.session).toEqual(mockSession)
      expect(result.error).toBeNull()
    })

    it('should refresh expired session', async () => {
      const expiredSession = { 
        access_token: 'expired-token', 
        expires_at: Date.now() / 1000 - 3600 
      }
      const newSession = { 
        access_token: 'new-token', 
        expires_at: Date.now() / 1000 + 3600 
      }
      
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: expiredSession },
        error: null
      })
      mockSupabase.auth.refreshSession.mockResolvedValue({
        data: { session: newSession },
        error: null
      })

      const result = await getSessionWithRefresh()

      expect(result.session).toEqual(newSession)
      expect(mockSupabase.auth.refreshSession).toHaveBeenCalled()
    })

    it('should handle session errors', async () => {
      const mockError = { message: 'Session error' }
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      const result = await getSessionWithRefresh()

      expect(result.session).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })

  describe('isSessionExpired', () => {
    it('should return true for expired session', () => {
      const expiredSession = { expires_at: Date.now() / 1000 - 3600 }
      const result = isSessionExpired(expiredSession)
      expect(result).toBe(true)
    })

    it('should return false for valid session', () => {
      const validSession = { expires_at: Date.now() / 1000 + 3600 }
      const result = isSessionExpired(validSession)
      expect(result).toBe(false)
    })

    it('should return true for session without expires_at', () => {
      const sessionWithoutExpiry = { access_token: 'token' }
      const result = isSessionExpired(sessionWithoutExpiry)
      expect(result).toBe(true)
    })
  })

  describe('changePassword', () => {
    it('should successfully change password', async () => {
      const mockUser = { id: '123', email: 'test@example.com' }
      const mockQuery = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockUser,
              error: null
            })
          })
        })
      }
      mockSupabase.from.mockReturnValue(mockQuery)
      
      // Mock successful sign in
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      // Mock successful password update
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      // Mock getCurrentUser to return our test user
      vi.mocked(getCurrentUser).mockResolvedValue({ user: mockUser, error: null })

      const result = await changePassword('oldpassword', 'newpassword123')

      expect(result.data).toBeDefined()
      expect(result.error).toBeNull()
    })

    it('should fail with wrong current password', async () => {
      const mockError = { message: 'Contraseña actual incorrecta' }
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError
      })

      vi.mocked(getCurrentUser).mockResolvedValue({ 
        user: { id: '123', email: 'test@example.com' }, 
        error: null 
      })

      const result = await changePassword('wrongpassword', 'newpassword123')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })
})

describe('Authentication Integration Tests', () => {
  describe('Complete Authentication Flow', () => {
    it('should handle complete user registration and login flow', async () => {
      // 1. Sign up
      const mockUser = { id: '123', email: 'test@example.com' }
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const signUpResult = await signUp('test@example.com', 'password123', 'Test User')
      expect(signUpResult.data).toBeDefined()

      // 2. Request password reset
      mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({
        data: { message: 'Reset email sent' },
        error: null
      })

      const resetResult = await requestPasswordReset('test@example.com')
      expect(resetResult.data).toBeDefined()

      // 3. Verify email
      mockSupabase.auth.verifyOtp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const verifyResult = await verifyEmail('verification-token')
      expect(verifyResult.data).toBeDefined()
    })
  })
})