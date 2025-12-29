/**
 * Script to reset a user's password in Supabase
 * Usage: npx tsx scripts/reset-user-password.ts <email> <new-password>
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const email = process.argv[2]
const newPassword = process.argv[3]

if (!email || !newPassword) {
  console.error('Usage: npx tsx scripts/reset-user-password.ts <email> <new-password>')
  process.exit(1)
}

async function resetPassword() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log(`Resetting password for: ${email}`)

  // Get user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('Error listing users:', listError)
    process.exit(1)
  }

  const user = users.users.find((u) => u.email === email)

  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  // Update user password
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  })

  if (error) {
    console.error('Error resetting password:', error)
    process.exit(1)
  }

  console.log('✅ Password reset successfully!')
  console.log(`User: ${email}`)
  console.log(`New password: ${newPassword}`)
}

resetPassword()
