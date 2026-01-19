import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'
import type { SocialPost, SocialPlatform, SocialPostStatus, SocialSourceType } from '@/lib/social/types'

interface PostStats {
  total: number
  byStatus: Record<SocialPostStatus, number>
  byPlatform: Record<SocialPlatform, number>
}

/**
 * GET /api/social/posts
 * List social posts with filtering and stats
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const platform = searchParams.get('platform') as SocialPlatform | null
    const status = searchParams.get('status') as SocialPostStatus | null
    const sourceType = searchParams.get('sourceType') as SocialSourceType | null
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query for posts
    let query = supabase
      .from('social_posts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (platform) {
      query = query.eq('platform', platform)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (sourceType) {
      query = query.eq('source_type', sourceType)
    }

    if (search) {
      query = query.or(`content.ilike.%${search}%,source_title.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: posts, error, count } = await query

    if (error) {
      throw error
    }

    // Get stats (separate query for all posts, not filtered)
    const { data: allPosts } = await supabase
      .from('social_posts')
      .select('status, platform')

    const stats: PostStats = {
      total: allPosts?.length || 0,
      byStatus: {
        draft: 0,
        queued: 0,
        scheduled: 0,
        publishing: 0,
        published: 0,
        failed: 0,
      },
      byPlatform: {
        twitter: 0,
        linkedin: 0,
        instagram: 0,
      },
    }

    allPosts?.forEach((post) => {
      if (post.status in stats.byStatus) {
        stats.byStatus[post.status as SocialPostStatus]++
      }
      if (post.platform in stats.byPlatform) {
        stats.byPlatform[post.platform as SocialPlatform]++
      }
    })

    return NextResponse.json({
      success: true,
      data: posts as SocialPost[],
      stats,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Social posts list error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/social/posts
 * Create a new social post
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const supabase = createAdminClient()
    const body = await request.json()

    // Validate required fields
    if (!body.platform || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, content' },
        { status: 400 }
      )
    }

    // Validate platform
    const validPlatforms: SocialPlatform[] = ['twitter', 'linkedin', 'instagram']
    if (!validPlatforms.includes(body.platform)) {
      return NextResponse.json(
        { error: 'Invalid platform' },
        { status: 400 }
      )
    }

    // Create post
    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        platform: body.platform,
        content: body.content,
        hashtags: body.hashtags || [],
        status: body.status || 'draft',
        source_type: body.sourceType || 'manual',
        source_id: body.sourceId || null,
        source_title: body.sourceTitle || null,
        source_url: body.sourceUrl || null,
        auto_publish: body.autoPublish || false,
        scheduled_at: body.scheduledAt || null,
        post_type: body.postType || 'auto_distributed',
        template_id: body.templateId || null,
        created_by: user.id,
      })
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
    console.error('Social post create error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create post' },
      { status: 500 }
    )
  }
}
