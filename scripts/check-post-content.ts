/**
 * Check content of a specific blog post
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

async function checkPostContent() {
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

    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', 'l')
      .single()

    if (error) {
      throw error
    }

    console.log('📄 Post Details:\n')
    console.log(`Title: ${post.title}`)
    console.log(`Slug: ${post.slug}`)
    console.log(`Status: ${post.status}`)
    console.log(`Created: ${new Date(post.created_at).toLocaleString()}`)
    console.log(`Updated: ${new Date(post.updated_at).toLocaleString()}`)
    console.log(`\nSummary (${post.summary?.length || 0} chars):\n${post.summary || '(empty)'}`)
    console.log(`\nContent Length: ${post.content?.length || 0} characters`)
    console.log(`Word Count (approx): ${post.content ? post.content.split(/\s+/).length : 0} words`)
    console.log(`\nHeader Image: ${post.header_image || '(none)'}`)
    console.log(`Tags: ${post.tags?.join(', ') || '(none)'}`)
    console.log(`Featured: ${post.featured ? 'Yes' : 'No'}`)

    console.log('\n--- First 500 characters of content ---')
    console.log(post.content?.substring(0, 500) || '(empty)')
    if (post.content?.length > 500) {
      console.log('...(truncated)...')
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkPostContent()
