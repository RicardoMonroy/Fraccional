// Authentication Middleware with Login Bypass
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile', 
  '/settings'
]

// Define auth routes
const authRoutes = [
  '/auth/login',
  '/auth/signup'
]

// Routes that can be accessed during login process
const loginBypassRoutes = [
  '/dashboard'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const { pathname, searchParams } = req.nextUrl

  // Check for auth tokens
  const accessToken = req.cookies.get('sb-access-token')?.value
  const refreshToken = req.cookies.get('sb-refresh-token')?.value
  
  const isAuthenticated = !!(accessToken || refreshToken)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isLoginBypass = loginBypassRoutes.some(route => pathname.startsWith(route))

  // Check if this is a redirect from login process
  const isFromLogin = searchParams.get('from') === 'login'

  console.log('Middleware check:', {
    pathname,
    isAuthenticated,
    isProtectedRoute,
    isAuthRoute,
    isLoginBypass,
    isFromLogin,
    hasAccessToken: !!accessToken
  })

  // Strategy 1: If accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    // Allow temporary access if it's a login bypass
    if (isLoginBypass && isFromLogin) {
      console.log('Allowing temporary access during login process')
      return res
    }
    
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    console.log('Redirecting to login (not authenticated):', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // Strategy 2: If accessing auth routes while authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    const redirectUrl = new URL('/dashboard', req.url)
    console.log('Authenticated user accessing auth route - redirecting to dashboard:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // Strategy 3: Allow access to login bypass routes
  if (isLoginBypass) {
    console.log('Allowing access to login bypass route')
    return res
  }

  // Strategy 4: Allow all other requests
  console.log('Allowing request')
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}