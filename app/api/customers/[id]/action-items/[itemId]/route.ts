import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

// PATCH /api/customers/[id]/action-items/[itemId]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params
    const supabase = await createClient()
    const body = await request.json()

    const updateData: Record<string, any> = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.due_date !== undefined) updateData.due_date = body.due_date || null
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to || null

    if (body.status !== undefined) {
      updateData.status = body.status
      if (body.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
    }

    const { data, error } = await supabase
      .from('customer_action_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('customer_id', id)
      .select('*, assigned_to_profile:profiles!assigned_to(id, full_name, email)')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update action item' },
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

// DELETE /api/customers/[id]/action-items/[itemId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemId } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('customer_action_items')
      .delete()
      .eq('id', itemId)
      .eq('customer_id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete action item' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
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
