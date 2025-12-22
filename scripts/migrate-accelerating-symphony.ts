import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as fs from 'fs'
import matter from 'gray-matter'
import { marked } from 'marked'

config({ path: path.resolve(process.cwd(), '.env.local') })

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
})

async function migratePost() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Read the MDX file
  const mdxPath = path.join(
    process.cwd(),
    'content/blog/accelerating-symphony-ai-autonomous-vehicles-robotics.mdx'
  )

  console.log('Reading MDX file:', mdxPath)

  const fileContents = fs.readFileSync(mdxPath, 'utf8')
  const { data: frontmatter, content } = matter(fileContents)

  // Convert Markdown to HTML
  const htmlContent = marked(content) as string

  console.log('Frontmatter:', frontmatter)
  console.log('Content length:', content.length, 'characters')

  // Get admin user ID
  const { data: adminUser, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'admin@novique.ai')
    .single()

  if (userError || !adminUser) {
    console.error('Could not find admin user:', userError)
    process.exit(1)
  }

  console.log('Admin user ID:', adminUser.id)

  // Prepare blog post data
  const slug = 'accelerating-symphony-ai-autonomous-vehicles-robotics'
  const postData = {
    slug,
    title: frontmatter.title,
    summary: frontmatter.summary,
    content: htmlContent,
    author_id: adminUser.id,
    header_image: frontmatter.headerImage,
    featured: frontmatter.featured || false,
    tags: frontmatter.tags || [],
    status: 'published',
    ai_generated: false,
    published_at: frontmatter.date,
    created_at: new Date().toISOString(),
  }

  console.log('Inserting blog post with slug:', slug)

  // Check if post already exists
  const { data: existingPost } = await supabase
    .from('blog_posts')
    .select('id, slug')
    .eq('slug', slug)
    .single()

  if (existingPost) {
    console.log('Post already exists, updating...')
    const { error: updateError } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('slug', slug)

    if (updateError) {
      console.error('Update error:', updateError)
      process.exit(1)
    }

    console.log('✅ Post updated successfully!')
  } else {
    const { error: insertError } = await supabase.from('blog_posts').insert([postData])

    if (insertError) {
      console.error('Insert error:', insertError)
      process.exit(1)
    }

    console.log('✅ Post migrated successfully!')
  }

  console.log(`View at: http://localhost:3001/blog/${slug}`)
}

migratePost()
