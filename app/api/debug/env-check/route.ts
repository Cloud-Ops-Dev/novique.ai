import { NextResponse } from 'next/server'

/**
 * Diagnostic endpoint to check environment variable availability
 * This helps debug the Vercel deployment issue where env vars aren't being injected
 *
 * SECURITY: This endpoint should be removed after debugging or protected with auth
 */
export async function GET() {
  const envVars = {
    supabase_url: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      prefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'undefined',
    },
    supabase_anon_key: {
      exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      prefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) || 'undefined',
    },
    supabase_service_role: {
      exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      prefix: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) || 'undefined',
    },
    runtime: process.env.NEXT_RUNTIME || 'nodejs',
    vercel_env: process.env.VERCEL_ENV || 'unknown',
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envVars,
    allEnvKeys: Object.keys(process.env).filter(key =>
      key.includes('SUPABASE') || key.includes('VERCEL')
    ),
  })
}
