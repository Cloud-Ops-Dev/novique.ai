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

async function migrateAllPosts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Get admin user ID
  const { data: adminUser, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', 'admin@novique.ai')
    .single()

  if (userError || !adminUser) {
    console.error('❌ Could not find admin user:', userError)
    process.exit(1)
  }

  console.log('✓ Found admin user:', adminUser.id)
  console.log('')

  // Get all MDX files
  const blogDir = path.join(process.cwd(), 'content/blog')
  const mdxFiles = fs.readdirSync(blogDir).filter((file) => file.endsWith('.mdx'))

  console.log(`📁 Found ${mdxFiles.length} MDX files to migrate:`)
  mdxFiles.forEach((file) => console.log(`   - ${file}`))
  console.log('')

  let successCount = 0
  let errorCount = 0
  const results: { slug: string; status: string; message: string }[] = []

  // Migrate each file
  for (const filename of mdxFiles) {
    const slug = filename.replace(/\.mdx$/, '')
    console.log(`\n📝 Processing: ${slug}`)

    try {
      const mdxPath = path.join(blogDir, filename)
      const fileContents = fs.readFileSync(mdxPath, 'utf8')
      const { data: frontmatter, content } = matter(fileContents)

      // Convert Markdown to HTML
      const htmlContent = marked(content) as string

      // Prepare blog post data
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

      // Check if post already exists
      const { data: existingPost } = await supabase
        .from('blog_posts')
        .select('id, slug')
        .eq('slug', slug)
        .single()

      if (existingPost) {
        console.log('   ↻ Post exists, updating...')
        const { error: updateError } = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('slug', slug)

        if (updateError) {
          console.error('   ❌ Update error:', updateError.message)
          errorCount++
          results.push({ slug, status: 'error', message: updateError.message })
          continue
        }

        console.log('   ✓ Updated successfully')
        successCount++
        results.push({ slug, status: 'updated', message: 'Updated existing post' })
      } else {
        const { error: insertError } = await supabase.from('blog_posts').insert([postData])

        if (insertError) {
          console.error('   ❌ Insert error:', insertError.message)
          errorCount++
          results.push({ slug, status: 'error', message: insertError.message })
          continue
        }

        console.log('   ✓ Migrated successfully')
        successCount++
        results.push({ slug, status: 'inserted', message: 'New post created' })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('   ❌ Error:', errorMessage)
      errorCount++
      results.push({ slug, status: 'error', message: errorMessage })
    }
  }

  // Summary
  console.log('\n')
  console.log('========================================')
  console.log('📊 MIGRATION SUMMARY')
  console.log('========================================')
  console.log(`Total files: ${mdxFiles.length}`)
  console.log(`✓ Successful: ${successCount}`)
  console.log(`❌ Errors: ${errorCount}`)
  console.log('')

  // Detailed results
  console.log('📋 DETAILED RESULTS:')
  results.forEach((result) => {
    const icon = result.status === 'error' ? '❌' : '✓'
    console.log(`${icon} ${result.slug}: ${result.message}`)
  })

  console.log('')
  console.log('========================================')

  if (errorCount > 0) {
    console.log('⚠️  Some posts failed to migrate. Check errors above.')
    process.exit(1)
  } else {
    console.log('✅ All posts migrated successfully!')
    console.log('')
    console.log('🌐 View at: http://localhost:3000/blog')
    console.log('✏️  Edit at: http://localhost:3000/admin/blog')
  }
}

migrateAllPosts()
