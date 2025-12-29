/**
 * Script to delete customers by name
 * Usage: npx tsx scripts/delete-customer.ts <customer-name>
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const customerName = process.argv[2]

if (!customerName) {
  console.error('Usage: npx tsx scripts/delete-customer.ts <customer-name>')
  process.exit(1)
}

async function deleteCustomers() {
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log(`Finding customers with name: ${customerName}`)

  // Find customers
  const { data: customers, error: findError } = await supabase
    .from('customers')
    .select('*')
    .ilike('name', `%${customerName}%`)

  if (findError) {
    console.error('Error finding customers:', findError)
    process.exit(1)
  }

  if (!customers || customers.length === 0) {
    console.log('No customers found with that name')
    return
  }

  console.log(`\nFound ${customers.length} customer(s):`)
  customers.forEach((c, i) => {
    console.log(`${i + 1}. ${c.name} (${c.email}) - Stage: ${c.stage}`)
  })

  // Delete customer interactions first (foreign key constraint)
  for (const customer of customers) {
    console.log(`\nDeleting interactions for customer: ${customer.name}`)
    const { error: interactionsError } = await supabase
      .from('customer_interactions')
      .delete()
      .eq('customer_id', customer.id)

    if (interactionsError) {
      console.error(`Error deleting interactions for ${customer.name}:`, interactionsError)
    }
  }

  // Delete customers
  const customerIds = customers.map((c) => c.id)
  const { error: deleteError } = await supabase
    .from('customers')
    .delete()
    .in('id', customerIds)

  if (deleteError) {
    console.error('Error deleting customers:', deleteError)
    process.exit(1)
  }

  console.log(`\n✅ Successfully deleted ${customers.length} customer(s)`)
}

deleteCustomers()
