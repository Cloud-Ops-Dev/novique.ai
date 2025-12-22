import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in browser/client components
 *
 * This client is used in:
 * - Client Components (marked with 'use client')
 * - React hooks (useAuth, useUser, etc.)
 * - Client-side event handlers
 *
 * IMPORTANT: Only use NEXT_PUBLIC_ environment variables in client code
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
