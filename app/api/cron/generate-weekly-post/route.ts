import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { generateBlogPost } from '@/lib/ai/contentGenerator'

export const dynamic = 'force-dynamic'

/**
 * Vercel Cron endpoint for weekly blog post generation
 * Triggered every Sunday at 9 AM
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET not configured')
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase environment variables not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get admin user ID
    const { data: adminUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@novique.ai')
      .single()

    if (!adminUser) {
      throw new Error('Admin user not found')
    }

    console.log('Starting weekly blog post generation via Cron...')

    // Generate blog post (let AI choose topic based on trending research)
    const result = await generateBlogPost(
      {
        keywords: ['AI', 'automation', 'small business', 'technology'],
        useOpenAI: false, // Use Claude by default
      },
      adminUser.id
    )

    if (!result.success) {
      console.error('Blog generation failed:', result.error)
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }

    console.log('✅ Weekly blog post generated successfully via Cron')
    console.log(`Post slug: ${result.slug}`)

    return NextResponse.json({
      success: true,
      data: {
        postId: result.postId,
        slug: result.slug,
        topic: result.generationData?.topic,
        status: 'pending_review',
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
