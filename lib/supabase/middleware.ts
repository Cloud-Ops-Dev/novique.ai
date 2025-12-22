import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Create a Supabase client for use in Next.js middleware
 *
 * This client is specifically designed for middleware and handles:
 * - Session refresh
 * - Cookie updates
 * - Auth state management between requests
 *
 * Use this ONLY in /middleware.ts
 */
export async function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  // Diagnostic logging for environment variable debugging
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('[Middleware Debug] Missing Supabase credentials:', {
      url: {
        exists: !!supabaseUrl,
        length: supabaseUrl?.length || 0,
        value: supabaseUrl?.substring(0, 30) || 'undefined',
      },
      key: {
        exists: !!supabaseKey,
        length: supabaseKey?.length || 0,
        value: supabaseKey?.substring(0, 20) || 'undefined',
      },
      runtime: process.env.NEXT_RUNTIME,
      vercelEnv: process.env.VERCEL_ENV,
      allSupabaseEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
    })
  }

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: This refreshes the session if expired
  // Must be called before returning response
  await supabase.auth.getUser()

  return { supabase, response }
}
