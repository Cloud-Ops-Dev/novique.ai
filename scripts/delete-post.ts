/**
 * Delete a specific blog post by slug
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

async function deletePost() {
  const slug = process.argv[2]

  if (!slug) {
    console.error('❌ Usage: npx tsx scripts/delete-post.ts <slug>')
    process.exit(1)
  }

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

    // First, check if the post exists
    const { data: post, error: fetchError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single()

    if (fetchError) {
      console.error(`❌ Post with slug "${slug}" not found`)
      process.exit(1)
    }

    console.log(`\n📄 Found post: "${post.title}"`)
    console.log(`   Slug: ${post.slug}`)
    console.log(`   Status: ${post.status}`)
    console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`)

    // Delete the post
    const { error: deleteError } = await supabase
      .from('blog_posts')
      .delete()
      .eq('slug', slug)

    if (deleteError) {
      throw deleteError
    }

    console.log(`\n✅ Successfully deleted post "${post.title}"`)
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

deletePost()
