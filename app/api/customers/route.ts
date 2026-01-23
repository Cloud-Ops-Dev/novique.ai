import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { requireAdminOrEditor, getCurrentUser } from '@/lib/auth/session'

// GET /api/customers - List all customers with filtering
export async function GET(request: NextRequest) {
  try {
    // Require admin or editor authentication (editors have read-only access)
    await requireAdminOrEditor()

    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    // Query parameters
    const stage = searchParams.get('stage')
    const status = searchParams.get('status') // project_status
    const assignedAdminId = searchParams.get('assigned_admin_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build query
    let query = supabase
      .from('customers')
      .select('*, assigned_admin:profiles!assigned_admin_id(id, full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (stage && stage !== 'all') {
      query = query.eq('stage', stage)
    }

    if (status && status !== 'all') {
      query = query.eq('project_status', status)
    }

    if (assignedAdminId) {
      query = query.eq('assigned_admin_id', assignedAdminId)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,business_type.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
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

// POST /api/customers - Create new customer (manual entry)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Create customer
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        name: body.name,
        email: body.email,
        phone: body.phone,
        business_type: body.business_type,
        business_size: body.business_size,
        initial_challenges: body.initial_challenges,
        assigned_admin_id: user.id,
        stage: 'proposal_development',
        project_status: 'on_track',
        roi_assessment_id: body.roi_assessment_id || null,
        roi_estimate: body.roi_estimate || null,
      })
      .select('*, assigned_admin:profiles!assigned_admin_id(id, full_name, email)')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // If created from ROI assessment, mark it as converted
    if (body.roi_assessment_id) {
      await supabase
        .from('roi_assessments')
        .update({
          converted: true,
          converted_at: new Date().toISOString(),
          converted_to_customer_id: customer.id,
        })
        .eq('id', body.roi_assessment_id)
    }

    // Create initial interaction
    const interactionNote = body.roi_assessment_id
      ? 'Customer created from ROI assessment'
      : 'Customer manually added to CRM'

    await supabase.from('customer_interactions').insert({
      customer_id: customer.id,
      interaction_type: 'note',
      subject: 'Customer record created',
      notes: interactionNote,
      created_by: user.id,
    })

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
