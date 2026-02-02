import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * POST /api/jarvis/blog
 * 
 * Create a blog post draft via Jarvis API (programmatic blog creation)
 * 
 * This endpoint provides the same functionality as the admin blog creation form
 * but uses Jarvis API key authentication instead of session authentication.
 * Always creates drafts for review before publishing.
 */
export async function POST(request: NextRequest) {
  // Validate Jarvis API key
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.slug || !body.summary || !body.content) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          required: ['title', 'slug', 'summary', 'content'],
          provided: Object.keys(body)
        },
        { status: 400 }
      );
    }

    // Auto-generate slug from title if needed
    let slug = body.slug;
    if (!slug && body.title) {
      slug = body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Trim leading/trailing hyphens
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existing) {
      return NextResponse.json(
        { 
          error: 'Slug already exists',
          slug,
          suggestion: `${slug}-${Date.now()}`
        }, 
        { status: 409 }
      );
    }

    // Get admin user (Mark Howell) as the author
    // This assumes there's an admin user to attribute posts to
    const { data: adminUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { error: 'No admin user found for attribution' },
        { status: 500 }
      );
    }

    // Prepare blog post data
    const blogData = {
      slug,
      title: body.title,
      summary: body.summary.substring(0, 300), // Enforce max length
      content: body.content,
      markdown_content: body.markdownContent || null,
      meta_description: body.metaDescription || body.summary.substring(0, 160),
      author_id: adminUser.id,
      header_image: body.headerImage || null,
      featured: body.featured || false,
      status: 'draft', // Always create as draft for safety
      tags: Array.isArray(body.tags) ? body.tags : [],
      // Social metadata
      key_insights: Array.isArray(body.keyInsights) ? body.keyInsights : [],
      core_takeaway: body.coreTakeaway || null,
      published_at: null, // Drafts don't have publish date
    };

    // Create the blog post
    const { data: blogPost, error: createError } = await supabase
      .from('blog_posts')
      .insert(blogData)
      .select('*, author:profiles(id, full_name, email)')
      .single();

    if (createError) {
      console.error('Blog post creation error:', createError);
      return NextResponse.json(
        { error: 'Failed to create blog post', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: blogPost,
      message: 'Blog post draft created successfully',
      admin_url: `https://www.novique.ai/admin/blog/${slug}`,
    });

  } catch (error: any) {
    console.error('Jarvis blog creation error:', error);
    return NextResponse.json(
      { error: 'Blog creation failed', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/jarvis/blog
 * 
 * List blog posts (for Jarvis to check existing content)
 */
export async function GET(request: NextRequest) {
  // Validate Jarvis API key
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') || 'draft';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);

    const { data, error, count } = await supabase
      .from('blog_posts')
      .select('id, slug, title, summary, status, created_at, author:profiles(full_name)', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      total: count || 0,
    });

  } catch (error: any) {
    console.error('Jarvis blog list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}