import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { requireAdminOrEditor, getCurrentUser } from '@/lib/auth/session'

// GET /api/customers/[id] - Get single customer with interactions
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin or editor authentication (editors have read-only access)
    await requireAdminOrEditor()

    const { id } = await params
    const supabase = createAdminClient()

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
    const { id: bodyId, created_at, updated_at, search_vector, interactions, assigned_admin, consultation_request_id, roi_assessment_id, ...updateData } = body

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

// DELETE /api/customers/[id] - Archive (soft delete) or Delete (hard delete)
// Use ?permanent=true for hard delete, otherwise archives to closed_lost
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
    const { searchParams } = new URL(request.url)
    const permanent = searchParams.get('permanent') === 'true'
    const supabase = await createClient()

    if (permanent) {
      // Hard delete - remove customer and all related data

      // First, clear any ROI assessment references to this customer
      await supabase
        .from('roi_assessments')
        .update({
          converted: false,
          converted_at: null,
          converted_to_customer_id: null,
        })
        .eq('converted_to_customer_id', id)

      // Delete interactions
      await supabase
        .from('customer_interactions')
        .delete()
        .eq('customer_id', id)

      // Then delete customer
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to delete customer' },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, action: 'deleted' })
    } else {
      // Soft delete by marking as closed_lost (archive)
      const { error } = await supabase
        .from('customers')
        .update({ stage: 'closed_lost' })
        .eq('id', id)

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json(
          { error: 'Failed to archive customer' },
          { status: 500 }
        )
      }

      // Log interaction
      await supabase.from('customer_interactions').insert({
        customer_id: id,
        interaction_type: 'stage_change',
        notes: 'Customer archived (marked as closed_lost)',
        created_by: user.id,
      })

      return NextResponse.json({ success: true, action: 'archived' })
    }
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
