import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

// Map ROI assessment industry to customer business_type
const INDUSTRY_TO_BUSINESS_TYPE: Record<string, string> = {
  home_services: 'other',
  professional_services: 'professional',
  healthcare: 'healthcare',
  retail: 'retail',
  real_estate: 'professional',
  construction: 'manufacturing',
  manufacturing: 'manufacturing',
  other: 'other',
}

// POST /api/roi-assessments/[id]/convert - Convert ROI assessment to customer
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

    // Get the ROI assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('roi_assessments')
      .select('*')
      .eq('id', id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'ROI assessment not found' },
        { status: 404 }
      )
    }

    // Check if already converted
    if (assessment.converted_to_customer_id) {
      return NextResponse.json(
        {
          error: 'ROI assessment already converted',
          customerId: assessment.converted_to_customer_id,
        },
        { status: 400 }
      )
    }

    // Map industry to business_type
    const businessType = assessment.industry
      ? INDUSTRY_TO_BUSINESS_TYPE[assessment.industry] || 'other'
      : undefined

    // Build initial challenges from selected workflows
    let initialChallenges = ''
    if (assessment.selected_workflows && assessment.selected_workflows.length > 0) {
      const workflowNames: Record<string, string> = {
        lead_followup: 'Lead Capture + Follow-up',
        appointment_scheduling: 'Appointment Scheduling + Reminders',
        invoice_generation: 'Invoice/Quote Generation',
        customer_intake: 'Customer Intake Forms',
        status_updates: 'Status Updates + Reporting',
        task_routing: 'Internal Task Routing',
        support_triage: 'Support Triage',
      }
      const workflows = assessment.selected_workflows
        .map((w: string) => workflowNames[w] || w)
        .join(', ')
      initialChallenges = `Interested in automation for: ${workflows}`
    }

    // Create customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        roi_assessment_id: assessment.id,
        name: assessment.email.split('@')[0], // Default name from email
        email: assessment.email,
        business_type: businessType,
        initial_challenges: initialChallenges,
        roi_estimate: assessment.calculated_results,
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
    const roiSummary = assessment.calculated_results
      ? `Est. monthly benefit: $${assessment.calculated_results.totalBenefitPerMonth?.toLocaleString() || 'N/A'}, ROI: ${assessment.calculated_results.roiPercent?.toLocaleString() || 'N/A'}%`
      : 'ROI assessment submitted'

    await supabase.from('customer_interactions').insert({
      customer_id: customer.id,
      interaction_type: 'note',
      subject: 'ROI Assessment Conversion',
      notes: `Customer created from ROI assessment. ${roiSummary}`,
      interaction_date: assessment.created_at,
      created_by: user.id,
    })

    // Update ROI assessment
    const { error: updateError } = await supabase
      .from('roi_assessments')
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
        converted_to_customer_id: customer.id,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Failed to update ROI assessment status:', updateError)
      // Don't fail the request since customer was created successfully
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
