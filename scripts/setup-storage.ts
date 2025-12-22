/**
 * Setup Script: Create Supabase Storage Bucket for Blog Images
 * Run with: npx tsx scripts/setup-storage.ts
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const BUCKET_NAME = 'blog-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

async function setupStorage() {
  console.log('🚀 Setting up Supabase Storage for blog images...\n')

  try {
    // Create Supabase client using service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    console.log(`📡 Connecting to Supabase: ${supabaseUrl}\n`)

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      throw new Error(`Failed to list buckets: ${listError.message}`)
    }

    const bucketExists = buckets?.some((b) => b.name === BUCKET_NAME)

    if (bucketExists) {
      console.log(`✅ Bucket '${BUCKET_NAME}' already exists`)
    } else {
      console.log(`📦 Creating bucket '${BUCKET_NAME}'...`)

      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
        allowedMimeTypes: ALLOWED_MIME_TYPES,
      })

      if (createError) {
        throw new Error(`Failed to create bucket: ${createError.message}`)
      }

      console.log(`✅ Bucket '${BUCKET_NAME}' created successfully`)
    }

    console.log('\n✨ Storage setup complete!')
    console.log('\nBucket configuration:')
    console.log(`  - Name: ${BUCKET_NAME}`)
    console.log(`  - Public: Yes`)
    console.log(`  - Max file size: ${MAX_FILE_SIZE / 1024 / 1024}MB`)
    console.log(`  - Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`)
  } catch (error) {
    console.error('\n❌ Setup failed:', error)
    process.exit(1)
  }
}

setupStorage()
