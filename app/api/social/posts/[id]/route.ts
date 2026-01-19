import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import type { SocialPost, SocialPostStatus } from '@/lib/social/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/social/posts/[id]
 * Get a single social post with source details
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: post, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      throw error
    }

    // If post has a source, fetch the source details
    let sourceDetails = null
    if (post.source_type === 'blog' && post.source_id) {
      const { data: blog } = await supabase
        .from('blog_posts')
        .select('slug, title, summary, header_image')
        .eq('id', post.source_id)
        .single()
      sourceDetails = blog
    } else if (post.source_type === 'lab' && post.source_id) {
      const { data: lab } = await supabase
        .from('labs')
        .select('slug, title, overview')
        .eq('id', post.source_id)
        .single()
      sourceDetails = lab
    }

    // Fetch template details if template_id exists
    let templateDetails = null
    if (post.template_id) {
      const { data: template } = await supabase
        .from('platform_templates')
        .select('template_name, display_name, tone')
        .eq('id', post.template_id)
        .single()
      templateDetails = template
    }

    return NextResponse.json({
      success: true,
      data: post as SocialPost,
      source: sourceDetails,
      template: templateDetails,
    })
  } catch (error) {
    console.error('Social post get error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/social/posts/[id]
 * Update a social post
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createAdminClient()
    const body = await request.json()

    // First check if post exists and its current status
    const { data: existing, error: fetchError } = await supabase
      .from('social_posts')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      throw fetchError
    }

    // Cannot update published posts (except for certain fields)
    if (existing.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot modify published posts' },
        { status: 400 }
      )
    }

    // Build update object with only allowed fields
    const updateData: Record<string, unknown> = {}

    if (body.content !== undefined) {
      updateData.content = body.content
    }

    if (body.hashtags !== undefined) {
      updateData.hashtags = body.hashtags
    }

    if (body.status !== undefined) {
      const validStatuses: SocialPostStatus[] = ['draft', 'queued', 'scheduled']
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status. Can only set to draft, queued, or scheduled' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    if (body.scheduledAt !== undefined) {
      updateData.scheduled_at = body.scheduledAt
      if (body.scheduledAt) {
        updateData.status = 'scheduled'
      }
    }

    if (body.autoPublish !== undefined) {
      updateData.auto_publish = body.autoPublish
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('social_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data as SocialPost,
    })
  } catch (error) {
    console.error('Social post update error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update post' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/social/posts/[id]
 * Delete a social post (only drafts can be deleted)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete posts
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - admin only' }, { status: 403 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // First check if post exists and its status
    const { data: existing, error: fetchError } = await supabase
      .from('social_posts')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 })
      }
      throw fetchError
    }

    // Cannot delete published posts
    if (existing.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot delete published posts' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Social post delete error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete post' },
      { status: 500 }
    )
  }
}
