import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

/**
 * GET /api/labs
 * List labs with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const status = searchParams.get('status')
    const authorId = searchParams.get('authorId')
    const featured = searchParams.get('featured')
    const tag = searchParams.get('tag')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('labs')
      .select('*, author:profiles(id, full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (authorId) {
      query = query.eq('author_id', authorId)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    if (tag) {
      query = query.contains('tags', [tag])
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Labs list error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch labs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/labs
 * Create new lab
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role (admin or editor)
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.slug || !body.overview) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, overview' },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from('labs')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    // Create lab
    const { data, error } = await supabase
      .from('labs')
      .insert({
        slug: body.slug,
        title: body.title,
        overview: body.overview,
        architecture: body.architecture || null,
        setup_deployment: body.setupDeployment || null,
        troubleshooting: body.troubleshooting || null,
        business_use: body.businessUse || null,
        workflow_svg: body.workflowSvg || null,
        github_url: body.githubUrl || null,
        github_metadata: body.githubMetadata || null,
        meta_description: body.metaDescription || body.overview?.substring(0, 160),
        author_id: user.id,
        featured: body.featured || false,
        status: body.status || 'draft',
        tags: body.tags || [],
        published_at: body.status === 'published' ? new Date().toISOString() : null,
        ai_generated: body.aiGenerated || false,
      })
      .select('*, author:profiles(id, full_name, email)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Lab create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create lab' },
      { status: 500 }
    )
  }
}
