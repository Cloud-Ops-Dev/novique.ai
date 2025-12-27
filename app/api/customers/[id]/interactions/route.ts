import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/customers/[id]/interactions - Get interaction timeline
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

    const { data, error } = await supabase
      .from('customer_interactions')
      .select('*, created_by_profile:profiles!created_by(id, full_name, email)')
      .eq('customer_id', id)
      .order('interaction_date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch interactions' },
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

// POST /api/customers/[id]/interactions - Add new interaction
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

    // Validate required fields
    if (!body.interaction_type) {
      return NextResponse.json(
        { error: 'Interaction type is required' },
        { status: 400 }
      )
    }

    // Create interaction
    const { data, error } = await supabase
      .from('customer_interactions')
      .insert({
        customer_id: id,
        interaction_type: body.interaction_type,
        subject: body.subject,
        notes: body.notes,
        interaction_date: body.interaction_date || new Date().toISOString(),
        created_by: user.id,
      })
      .select('*, created_by_profile:profiles!created_by(id, full_name, email)')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create interaction' },
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
