import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/session'

// GET /api/consultations - List all consultation requests
export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Query parameters
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('consultation_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch consultations' },
        { status: 500 }
      )
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
  } catch (error: any) {
    // Check if error is from requireAdmin redirect
    if (error?.message?.includes('NEXT_REDIRECT')) {
      throw error
    }
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
