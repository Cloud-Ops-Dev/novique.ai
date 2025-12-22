/**
 * List all blog posts in database
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

async function listBlogPosts() {
  console.log('📝 Listing all blog posts...\n')

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

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, slug, title, status, created_at, author:profiles(full_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    console.log(`Found ${posts?.length || 0} blog posts:\n`)
    posts?.forEach((post, index) => {
      const author = Array.isArray(post.author) ? post.author[0] : post.author
      console.log(`${index + 1}. ${post.title}`)
      console.log(`   Slug: ${post.slug}`)
      console.log(`   Status: ${post.status}`)
      console.log(`   Author: ${author?.full_name || author?.email}`)
      console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`)
      console.log(`   ID: ${post.id}`)
      console.log()
    })
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

listBlogPosts()
