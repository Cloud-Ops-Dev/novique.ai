import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminOrEditor } from '@/lib/auth/session'

// GET /api/roi-assessments - List all ROI calculator submissions
export async function GET(request: NextRequest) {
  try {
    // Require admin or editor authentication
    await requireAdminOrEditor()

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    // Query parameters
    const contacted = searchParams.get('contacted')
    const converted = searchParams.get('converted')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    // Build query
    let query = supabase
      .from('roi_assessments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (contacted === 'true') {
      query = query.eq('contacted', true)
    } else if (contacted === 'false') {
      query = query.eq('contacted', false)
    }

    if (converted === 'true') {
      query = query.eq('converted', true)
    } else if (converted === 'false') {
      query = query.or('converted.is.null,converted.eq.false')
    }

    if (search) {
      query = query.ilike('email', `%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch ROI assessments' },
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

// PATCH /api/roi-assessments - Update an ROI assessment (mark as contacted, add notes)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdminOrEditor()

    const supabase = createAdminClient()
    const body = await request.json()
    const { id, contacted, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Assessment ID required' },
        { status: 400 }
      )
    }

    const updates: Record<string, unknown> = {}
    if (typeof contacted === 'boolean') {
      updates.contacted = contacted
      if (contacted) {
        updates.contacted_at = new Date().toISOString()
      }
    }
    if (typeof notes === 'string') {
      updates.notes = notes
    }

    const { data, error } = await supabase
      .from('roi_assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update ROI assessment' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
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
