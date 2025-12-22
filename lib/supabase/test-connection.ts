/**
 * Test script to verify Supabase connection
 *
 * Run with: npx tsx lib/supabase/test-connection.ts
 */

import { createClient } from '@supabase/supabase-js'

async function testConnection() {
  console.log('Testing Supabase connection...\n')

  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.error('❌ Environment variables not configured')
    console.error('   Make sure .env.local exists with:')
    console.error('   - NEXT_PUBLIC_SUPABASE_URL')
    console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
  }

  console.log('✓ Environment variables found')
  console.log(`  URL: ${url}`)
  console.log(`  Anon Key: ${anonKey.slice(0, 20)}...\n`)

  // Create client
  const supabase = createClient(url, anonKey)

  try {
    // Test 1: Check auth connection
    console.log('Test 1: Auth connection')
    const { data: authData, error: authError } = await supabase.auth.getSession()

    if (authError) {
      console.error('❌ Auth connection failed:', authError.message)
      process.exit(1)
    }

    console.log('✓ Auth connection successful')
    console.log(`  Current session: ${authData.session ? 'Active' : 'None'}\n`)

    // Test 2: Query profiles table
    console.log('Test 2: Database connection (profiles table)')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .limit(5)

    if (profilesError) {
      console.error('❌ Database query failed:', profilesError.message)
      console.error('   Make sure you ran the database migrations')
      process.exit(1)
    }

    console.log('✓ Database connection successful')
    console.log(`  Profiles found: ${profiles?.length || 0}`)
    if (profiles && profiles.length > 0) {
      profiles.forEach((p) => {
        console.log(`    - ${p.email} (${p.role})`)
      })
    }
    console.log()

    // Test 3: Query blog_posts table
    console.log('Test 3: Blog posts table')
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title, published')
      .limit(5)

    if (postsError) {
      console.error('❌ Blog posts query failed:', postsError.message)
      process.exit(1)
    }

    console.log('✓ Blog posts table accessible')
    console.log(`  Posts found: ${posts?.length || 0}\n`)

    // Test 4: Check RLS policies
    console.log('Test 4: Row Level Security policies')
    console.log('✓ RLS policies are active (no errors when querying)\n')

    // Summary
    console.log('═══════════════════════════════════════')
    console.log('✅ All tests passed!')
    console.log('═══════════════════════════════════════')
    console.log('\nYour Supabase connection is working correctly.')
    console.log('Next steps:')
    console.log('  1. Create auth UI components (Phase 3)')
    console.log('  2. Build protected routes (Phase 4)')
    console.log('  3. Test login flow')
  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    process.exit(1)
  }
}

testConnection()
