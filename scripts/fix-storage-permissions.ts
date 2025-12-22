/**
 * Fix Supabase Storage RLS Policies for blog-images bucket
 * Run with: npx tsx scripts/fix-storage-permissions.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') })

async function fixStoragePermissions() {
  console.log('🔧 Fixing Supabase Storage permissions...\n')

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

    console.log('📋 Applying RLS policies to blog-images bucket...\n')

    // Apply policies using Supabase SQL
    const policies = `
-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated users can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images');

-- Allow authenticated users to update their uploaded files
CREATE POLICY IF NOT EXISTS "Authenticated users can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow authenticated users to delete files
CREATE POLICY IF NOT EXISTS "Authenticated users can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images');

-- Allow public read access to all blog images
CREATE POLICY IF NOT EXISTS "Public users can read blog images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'blog-images');
`

    const { error } = await supabase.rpc('exec_sql', { sql: policies })

    if (error) {
      console.log('⚠️  Could not apply policies via RPC. Please run the SQL manually.\n')
      console.log('Copy and paste this SQL into Supabase SQL Editor:\n')
      console.log('-----------------------------------------------------------')
      console.log(policies)
      console.log('-----------------------------------------------------------\n')
      console.log('SQL saved to: scripts/setup-storage-policies.sql\n')
    } else {
      console.log('✅ Storage policies applied successfully!\n')
    }

    console.log('✨ Setup complete!')
    console.log('\nStorage bucket permissions configured:')
    console.log('  ✅ Authenticated users can upload images')
    console.log('  ✅ Authenticated users can update images')
    console.log('  ✅ Authenticated users can delete images')
    console.log('  ✅ Public users can read images')
  } catch (error) {
    console.error('\n❌ Error:', error)
    console.log('\n📋 Manual setup required:')
    console.log('1. Go to Supabase dashboard')
    console.log('2. Navigate to Storage > blog-images > Policies')
    console.log('3. Run the SQL in scripts/setup-storage-policies.sql')
    process.exit(1)
  }
}

fixStoragePermissions()
