/**
 * Script to update a user's email in Supabase
 * Usage: npx tsx scripts/update-user-email.ts <old-email> <new-email>
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const oldEmail = process.argv[2]
const newEmail = process.argv[3]

if (!oldEmail || !newEmail) {
  console.error('Usage: npx tsx scripts/update-user-email.ts <old-email> <new-email>')
  process.exit(1)
}

async function updateEmail() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log(`Updating email from: ${oldEmail}`)
  console.log(`                 to: ${newEmail}`)

  // Get user by old email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError)
    process.exit(1)
  }

  const user = users.users.find((u) => u.email === oldEmail)

  if (!user) {
    console.error(`User not found: ${oldEmail}`)
    process.exit(1)
  }

  console.log(`Found user ID: ${user.id}`)

  // Update user email in auth
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    email: newEmail,
  })

  if (error) {
    console.error('Error updating email in auth:', error)
    process.exit(1)
  }

  console.log('✅ Email updated in auth successfully!')

  // Update email in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email: newEmail })
    .eq('id', user.id)

  if (profileError) {
    console.error('Error updating email in profiles:', profileError)
    console.error('Auth email was updated, but profile email was not. Please update manually.')
    process.exit(1)
  }

  console.log('✅ Email updated in profiles successfully!')
  console.log(`\nUser email has been changed from ${oldEmail} to ${newEmail}`)
}

updateEmail()
