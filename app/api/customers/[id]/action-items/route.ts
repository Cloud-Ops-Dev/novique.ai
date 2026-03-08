import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/customers/[id]/action-items
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const phase = searchParams.get('phase')
    const status = searchParams.get('status')

    let query = supabase
      .from('customer_action_items')
      .select('*, assigned_to_profile:profiles!assigned_to(id, full_name, email)')
      .eq('customer_id', id)

    if (phase) {
      query = query.eq('phase', phase)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
      .order('status', { ascending: true })
      .order('due_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch action items' },
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

// POST /api/customers/[id]/action-items
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    if (!body.phase || !body.title) {
      return NextResponse.json(
        { error: 'Phase and title are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('customer_action_items')
      .insert({
        customer_id: id,
        phase: body.phase,
        title: body.title,
        description: body.description || null,
        due_date: body.due_date || null,
        assigned_to: body.assigned_to || null,
        source_interaction_id: body.source_interaction_id || null,
        created_by: user.id,
      })
      .select('*, assigned_to_profile:profiles!assigned_to(id, full_name, email)')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create action item' },
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
