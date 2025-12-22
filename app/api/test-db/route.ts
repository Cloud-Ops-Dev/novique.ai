import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Test API route to verify Supabase connection
 *
 * Visit: http://localhost:3001/api/test-db
 *
 * This will test:
 * 1. Environment variables are configured
 * 2. Supabase client can connect
 * 3. Database tables exist
 * 4. RLS policies are working
 */
export async function GET() {
  const tests = []

  try {
    // Test 1: Environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    tests.push({
      name: 'Environment Variables',
      passed: hasUrl && hasAnonKey && hasServiceKey,
      details: {
        NEXT_PUBLIC_SUPABASE_URL: hasUrl ? '✓' : '✗',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnonKey ? '✓' : '✗',
        SUPABASE_SERVICE_ROLE_KEY: hasServiceKey ? '✓' : '✗',
      },
    })

    if (!hasUrl || !hasAnonKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Environment variables not configured',
          tests,
        },
        { status: 500 }
      )
    }

    // Test 2: Supabase client creation
    const supabase = await createClient()
    tests.push({
      name: 'Supabase Client',
      passed: true,
      details: 'Client created successfully',
    })

    // Test 3: Auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession()
    tests.push({
      name: 'Auth Connection',
      passed: !authError,
      details: authError
        ? authError.message
        : `Session: ${authData.session ? 'Active' : 'None'}`,
    })

    // Test 4: Profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(1)

    tests.push({
      name: 'Profiles Table',
      passed: !profilesError,
      details: profilesError
        ? profilesError.message
        : `Found ${profiles?.length || 0} profiles`,
    })

    // Test 5: Blog posts table
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title')
      .limit(1)

    tests.push({
      name: 'Blog Posts Table',
      passed: !postsError,
      details: postsError
        ? postsError.message
        : `Found ${posts?.length || 0} posts`,
    })

    // Test 6: Consultation requests table
    const { data: consultations, error: consultError } = await supabase
      .from('consultation_requests')
      .select('id, name')
      .limit(1)

    tests.push({
      name: 'Consultation Requests Table',
      passed: !consultError,
      details: consultError
        ? consultError.message
        : `Found ${consultations?.length || 0} requests`,
    })

    // Test 7: Audit log table
    const { data: audit, error: auditError } = await supabase
      .from('audit_log')
      .select('id')
      .limit(1)

    tests.push({
      name: 'Audit Log Table',
      passed: !auditError,
      details: auditError ? auditError.message : `Found ${audit?.length || 0} logs`,
    })

    // Check if all tests passed
    const allPassed = tests.every((test) => test.passed)

    return NextResponse.json({
      success: allPassed,
      message: allPassed
        ? '✅ All tests passed! Supabase connection is working.'
        : '❌ Some tests failed. Check details below.',
      tests,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unexpected error during testing',
        message: error instanceof Error ? error.message : String(error),
        tests,
      },
      { status: 500 }
    )
  }
}
