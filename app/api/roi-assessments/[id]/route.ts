import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { requireAdminOrEditor } from '@/lib/auth/session'

// DELETE /api/roi-assessments/[id] - Delete ROI assessment
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminOrEditor()
    const { id } = await params
    const supabase = createAdminClient()

    // First, unlink any customers that reference this ROI assessment
    // This preserves the customer record but removes the FK constraint
    const { error: unlinkError } = await supabase
      .from('customers')
      .update({ roi_assessment_id: null })
      .eq('roi_assessment_id', id)

    if (unlinkError) {
      console.error('Failed to unlink customers:', unlinkError)
      return NextResponse.json(
        { error: 'Failed to unlink associated customers' },
        { status: 500 }
      )
    }

    // Now delete the ROI assessment
    const { error } = await supabase
      .from('roi_assessments')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to delete ROI assessment' },
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
