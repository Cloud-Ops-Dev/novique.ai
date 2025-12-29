import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

interface RouteParams {
  params: Promise<{ slug: string }>
}

/**
 * GET /api/labs/[slug]
 * Get single lab by slug
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Lab fetch error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch lab' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/labs/[slug]
 * Update existing lab
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check role
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()
    const body = await request.json()

    // Get existing lab
    const { data: existing, error: fetchError } = await supabase
      .from('labs')
      .select('*')
      .eq('slug', slug)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
    }

    // Check ownership (editors can only edit their own labs)
    if (user.role !== 'admin' && existing.author_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Build update object
    const updates: Record<string, unknown> = {
      title: body.title ?? existing.title,
      overview: body.overview ?? existing.overview,
      architecture: body.architecture ?? existing.architecture,
      setup_deployment: body.setupDeployment ?? existing.setup_deployment,
      troubleshooting: body.troubleshooting ?? existing.troubleshooting,
      business_use: body.businessUse ?? existing.business_use,
      workflow_svg: body.workflowSvg ?? existing.workflow_svg,
      github_url: body.githubUrl ?? existing.github_url,
      meta_description: body.metaDescription ?? existing.meta_description,
      featured: body.featured ?? existing.featured,
      tags: body.tags ?? existing.tags,
      updated_at: new Date().toISOString(),
    }

    // Only admins can change status and slug
    if (user.role === 'admin') {
      if (body.status) {
        updates.status = body.status
        // Set published_at on first publish
        if (body.status === 'published' && !existing.published_at) {
          updates.published_at = new Date().toISOString()
        }
      }
      if (body.slug && body.slug !== slug) {
        // Check if new slug exists
        const { data: slugExists } = await supabase
          .from('labs')
          .select('id')
          .eq('slug', body.slug)
          .single()

        if (slugExists) {
          return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
        }
        updates.slug = body.slug
      }
    }

    const { data, error } = await supabase
      .from('labs')
      .update(updates)
      .eq('slug', slug)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('Lab update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update lab' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/labs/[slug]
 * Delete lab (admin only)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = await createClient()

    const { error } = await supabase.from('labs').delete().eq('slug', slug)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Lab deleted successfully',
    })
  } catch (error) {
    console.error('Lab delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete lab' },
      { status: 500 }
    )
  }
}
