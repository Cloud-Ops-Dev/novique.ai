/**
 * Check users in database
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

async function checkUsers() {
  console.log('🔍 Checking users in database...\n')

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      throw authError
    }

    console.log(`📧 Auth Users: ${authUsers.users.length} found\n`)
    authUsers.users.forEach((user) => {
      console.log(`  - ${user.email}`)
      console.log(`    ID: ${user.id}`)
      console.log(`    Created: ${new Date(user.created_at).toLocaleString()}`)
      console.log(`    Email confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log()
    })

    // Check profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      throw profilesError
    }

    console.log(`👤 Profiles: ${profiles?.length || 0} found\n`)
    profiles?.forEach((profile) => {
      console.log(`  - ${profile.email}`)
      console.log(`    ID: ${profile.id}`)
      console.log(`    Name: ${profile.full_name || 'Not set'}`)
      console.log(`    Role: ${profile.role}`)
      console.log()
    })
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkUsers()
