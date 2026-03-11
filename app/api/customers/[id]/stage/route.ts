import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

const VALID_STAGES = [
  'consultation_requested',
  'consultation_in_progress',
  'consultation_completed',
  'proposal_development',
  'proposal_sent',
  'negotiation',
  'project_active',
  'implementation',
  'delivered',
  'signed_off',
  'closed_won',
  'closed_lost',
] as const

// PATCH /api/customers/[id]/stage - Change customer stage
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { stage } = body

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get current stage
    const { data: current, error: fetchError } = await supabase
      .from('customers')
      .select('stage')
      .eq('id', id)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const previousStage = current.stage

    if (previousStage === stage) {
      return NextResponse.json({ success: true, data: { stage, previousStage } })
    }

    // Update stage
    const { error: updateError } = await supabase
      .from('customers')
      .update({ stage })
      .eq('id', id)

    if (updateError) {
      console.error('Stage update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update stage' },
        { status: 500 }
      )
    }

    // Log the stage change as an interaction
    const stageLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    await supabase.from('customer_interactions').insert({
      customer_id: id,
      interaction_type: 'stage_change',
      notes: `Stage changed from ${stageLabel(previousStage)} to ${stageLabel(stage)}`,
      created_by: user.id,
    })

    return NextResponse.json({
      success: true,
      data: { stage, previousStage },
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
