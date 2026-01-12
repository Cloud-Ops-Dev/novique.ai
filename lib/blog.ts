import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

// Configure marked to handle inline HTML and markdown properly
marked.setOptions({
  breaks: true,
  gfm: true,
})

export interface BlogPost {
  slug: string
  title: string
  summary: string
  content: string
  author: string
  date: string
  headerImage: string
  featured: boolean
  tags: string[]
  source?: 'database' | 'mdx' // Track where post came from
  status?: string
  aiGenerated?: boolean
  // Social metadata (source of truth for platform adapters)
  keyInsights?: string[] // 3 bullet points for social distribution
  coreTakeaway?: string // Single sentence summary for sharp posts
}

const postsDirectory = path.join(process.cwd(), 'content/blog')

// ============================
// MDX File Functions (Legacy)
// ============================

function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return []
  }
  return fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.mdx'))
}

function getPostBySlugFromFile(slug: string): BlogPost | undefined {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`)

    if (!fs.existsSync(fullPath)) {
      return undefined
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    // Convert Markdown to HTML
    const htmlContent = marked(content)

    return {
      slug,
      title: data.title || '',
      summary: data.summary || '',
      content: htmlContent as string,
      author: data.author || '',
      date: data.date || '',
      headerImage: data.headerImage || '',
      featured: data.featured || false,
      tags: data.tags || [],
      source: 'mdx',
    }
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error)
    return undefined
  }
}

function getAllPostsFromFiles(): BlogPost[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, '')
      return getPostBySlugFromFile(slug)
    })
    .filter((post): post is BlogPost => post !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return posts
}

// ============================
// Database Functions
// ============================

async function getAllPostsFromDatabase(): Promise<BlogPost[]> {
  try {
    // Use admin client for fetching published posts since they should be publicly accessible
    // This bypasses RLS policies which may block anonymous users
    const supabase = (await import('@/lib/supabase/server')).createAdminClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name, email)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error('Database fetch error:', error)
      return []
    }

    return (data || []).map((post) => ({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      content: post.content,
      author: post.author?.full_name || post.author?.email || 'Unknown',
      date: post.published_at || post.created_at,
      headerImage: post.header_image || '',
      featured: post.featured,
      tags: post.tags || [],
      source: 'database' as const,
      status: post.status,
      aiGenerated: post.ai_generated,
      // Social metadata
      keyInsights: post.key_insights || undefined,
      coreTakeaway: post.core_takeaway || undefined,
    }))
  } catch (error) {
    console.error('Error fetching posts from database:', error)
    return []
  }
}

async function getPostBySlugFromDatabase(slug: string): Promise<BlogPost | undefined> {
  try {
    // Use admin client for fetching published posts since they should be publicly accessible
    // This bypasses RLS policies which may block anonymous users
    const supabase = (await import('@/lib/supabase/server')).createAdminClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name, email)')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) {
      return undefined
    }

    return {
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      author: data.author?.full_name || data.author?.email || 'Unknown',
      date: data.published_at || data.created_at,
      headerImage: data.header_image || '',
      featured: data.featured,
      tags: data.tags || [],
      source: 'database',
      status: data.status,
      aiGenerated: data.ai_generated,
      // Social metadata
      keyInsights: data.key_insights || undefined,
      coreTakeaway: data.core_takeaway || undefined,
    }
  } catch (error) {
    console.error(`Error fetching post ${slug} from database:`, error)
    return undefined
  }
}

// ============================
// Hybrid Functions (Public API)
// ============================

/**
 * Get all published blog posts from both database and MDX files
 * Database posts take precedence over MDX posts with same slug
 */
export async function getAllPosts(): Promise<BlogPost[]> {
  // Get posts from both sources
  const dbPosts = await getAllPostsFromDatabase()
  const filePosts = getAllPostsFromFiles()

  // Create a map of database posts by slug for quick lookup
  const dbPostSlugs = new Set(dbPosts.map((p) => p.slug))

  // Filter out MDX posts that exist in database (database takes precedence)
  const uniqueFilePosts = filePosts.filter((post) => !dbPostSlugs.has(post.slug))

  // Combine and sort: featured first (by date), then non-featured (by date)
  const allPosts = [...dbPosts, ...uniqueFilePosts].sort((a, b) => {
    // If one is featured and the other isn't, featured comes first
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1

    // If both have same featured status, sort by date (newest first)
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  return allPosts
}

/**
 * Get featured blog posts (up to 3)
 */
export async function getFeaturedPosts(): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.featured).slice(0, 3)
}

/**
 * Get single blog post by slug
 * Checks database first, falls back to MDX file
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  // Check database first
  const dbPost = await getPostBySlugFromDatabase(slug)
  if (dbPost) {
    return dbPost
  }

  // Fall back to MDX file
  return getPostBySlugFromFile(slug)
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  return allPosts.filter((post) => post.tags.includes(tag))
}

/**
 * Get all unique tags from all posts
 */
export async function getAllTags(): Promise<string[]> {
  const allPosts = await getAllPosts()
  const tagSet = new Set<string>()

  allPosts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag))
  })

  return Array.from(tagSet).sort()
}

/**
 * Search posts by title, summary, or content
 */
export async function searchPosts(query: string): Promise<BlogPost[]> {
  const allPosts = await getAllPosts()
  const lowerQuery = query.toLowerCase()

  return allPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.summary.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}
