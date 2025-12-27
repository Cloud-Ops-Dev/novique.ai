import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

// POST /api/consultations/[id]/convert - Convert consultation to customer
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

    // Get the consultation request
    const { data: consultation, error: consultationError } = await supabase
      .from('consultation_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (consultationError || !consultation) {
      return NextResponse.json(
        { error: 'Consultation request not found' },
        { status: 404 }
      )
    }

    // Check if already converted
    if (consultation.converted_to_customer_id) {
      return NextResponse.json(
        {
          error: 'Consultation already converted',
          customerId: consultation.converted_to_customer_id,
        },
        { status: 400 }
      )
    }

    // Create customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        consultation_request_id: consultation.id,
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone,
        business_type: consultation.business_type,
        business_size: consultation.business_size,
        initial_challenges: consultation.challenges,
        assigned_admin_id: user.id,
        stage: 'proposal_development',
        project_status: 'on_track',
      })
      .select()
      .single()

    if (customerError) {
      console.error('Failed to create customer:', customerError)
      return NextResponse.json(
        { error: 'Failed to create customer record' },
        { status: 500 }
      )
    }

    // Create initial interaction
    await supabase.from('customer_interactions').insert({
      customer_id: customer.id,
      interaction_type: 'consultation_request',
      subject: 'Initial consultation request',
      notes: `Preferred meeting: ${consultation.meeting_type} on ${consultation.preferred_date} at ${consultation.preferred_time}`,
      interaction_date: consultation.created_at,
      created_by: user.id,
    })

    // Update consultation request
    const { error: updateError } = await supabase
      .from('consultation_requests')
      .update({
        status: 'converted',
        converted_to_customer_id: customer.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update consultation status:', updateError)
      // Don't fail the request since customer was created successfully
      // Just log the error for debugging
    }

    return NextResponse.json({
      success: true,
      data: customer,
      customerId: customer.id,
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
