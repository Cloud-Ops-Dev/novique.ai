import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/customers/[id] - Get single customer with interactions
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

    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*, assigned_admin:profiles!assigned_admin_id(id, full_name, email)')
      .eq('id', id)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Get interactions
    const { data: interactions } = await supabase
      .from('customer_interactions')
      .select('*, created_by_profile:profiles!created_by(id, full_name, email)')
      .eq('customer_id', id)
      .order('interaction_date', { ascending: false })

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        interactions: interactions || [],
      },
    })
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

// PUT /api/customers/[id] - Update customer
export async function PUT(
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

    // Remove fields that shouldn't be directly updated
    const { id: bodyId, created_at, updated_at, search_vector, interactions, assigned_admin, ...updateData } = body

    // Update customer (trigger will handle stage progression)
    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: customer })
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

// DELETE /api/customers/[id] - Soft delete (mark as closed_lost)
export async function DELETE(
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

    // Soft delete by marking as closed_lost
    const { error } = await supabase
      .from('customers')
      .update({ stage: 'closed_lost' })
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete customer' },
        { status: 500 }
      )
    }

    // Log interaction
    await supabase.from('customer_interactions').insert({
      customer_id: id,
      interaction_type: 'stage_change',
      notes: 'Customer marked as closed_lost',
      created_by: user.id,
    })

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
