/**
 * Script to list all users in Supabase
 * Usage: npx tsx scripts/list-users.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

async function listUsers() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log('Fetching users...\n')

  const { data: users, error } = await supabase.auth.admin.listUsers()

  if (error) {
    console.error('Error listing users:', error)
    process.exit(1)
  }

  console.log(`Found ${users.users.length} users:\n`)

  for (const user of users.users) {
    console.log(`Email: ${user.email}`)
    console.log(`ID: ${user.id}`)
    console.log(`Created: ${user.created_at}`)
    console.log(`Last Sign In: ${user.last_sign_in_at || 'Never'}`)
    console.log('---')
  }

  // Also get profiles
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')

  if (!profileError && profiles) {
    console.log('\nProfiles:')
    for (const profile of profiles) {
      console.log(`Email: ${profile.email}`)
      console.log(`Full Name: ${profile.full_name}`)
      console.log(`Role: ${profile.role}`)
      console.log('---')
    }
  }
}

listUsers()
