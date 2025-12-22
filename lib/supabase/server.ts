import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Create a Supabase client for use in Server Components, Server Actions, and Route Handlers
 *
 * This is the MOST CRITICAL file for server-side auth.
 *
 * Use this client in:
 * - Server Components (app router pages and layouts)
 * - Server Actions
 * - API Route Handlers
 * - Any server-side code that needs to check auth or query database
 *
 * SECURITY:
 * - Uses anon key (not service role) for RLS enforcement
 * - Automatically handles session cookies
 * - All database queries respect Row Level Security policies
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * Create a Supabase admin client with service role key
 *
 * WARNING: USE WITH EXTREME CAUTION
 * This client bypasses Row Level Security policies.
 *
 * Only use for:
 * - Admin operations that need to bypass RLS
 * - System-level operations
 * - Background jobs
 *
 * NEVER expose this client to the browser or use in client components.
 */
export function createAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {},
      },
    }
  )
}
