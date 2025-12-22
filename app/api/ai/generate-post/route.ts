import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateBlogPost } from '@/lib/ai/contentGenerator'

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user role (only admin and editor can generate posts)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'editor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { topic, keywords, useOpenAI } = body

    // Validate input
    if (!topic && (!keywords || keywords.length === 0)) {
      return NextResponse.json(
        { error: 'Either topic or keywords must be provided' },
        { status: 400 }
      )
    }

    // Generate blog post
    const result = await generateBlogPost(
      {
        topic,
        keywords,
        useOpenAI: useOpenAI || false,
      },
      user.id
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate blog post' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        postId: result.postId,
        slug: result.slug,
        generationData: result.generationData,
      },
    })
  } catch (error) {
    console.error('Generate post API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
