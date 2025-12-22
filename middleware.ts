import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

/**
 * Global middleware for session management
 *
 * This middleware:
 * 1. Runs on EVERY request to the application
 * 2. Refreshes the user's session if it's expired
 * 3. Updates session cookies automatically
 * 4. Makes auth state available to all pages
 *
 * CRITICAL: This must run before any protected routes are accessed
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request)

  // Refresh session if expired - this is handled by getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Optional: Add custom logic here for protected routes
  // For example, redirect to login if accessing admin routes without auth
  // We'll implement route protection in Phase 4

  return response
}

/**
 * Configure which routes this middleware runs on
 *
 * By default, middleware runs on ALL routes.
 * Use matcher to exclude static files and API routes that don't need auth.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
