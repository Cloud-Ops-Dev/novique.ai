import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth/session'

// GET /api/dashboard/stats - Get all dashboard metrics
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // ============================================
    // 1. REVENUE METRICS
    // ============================================

    // Total revenue YTD (payment confirmed this year)
    const currentYear = new Date().getFullYear()
    const { data: revenueData } = await supabase
      .from('customers')
      .select('agreed_implementation_cost, payment_confirmed_date, stage')

    const ytdRevenue = revenueData
      ?.filter((c) => {
        if (!c.payment_confirmed_date) return false
        const year = new Date(c.payment_confirmed_date).getFullYear()
        return year === currentYear
      })
      .reduce((sum, c) => sum + (Number(c.agreed_implementation_cost) || 0), 0) || 0

    // Pipeline value (proposal_sent, negotiation, project_active)
    const pipelineValue = revenueData
      ?.filter((c) =>
        ['proposal_sent', 'negotiation', 'project_active'].includes(c.stage)
      )
      .reduce((sum, c) => sum + (Number(c.agreed_implementation_cost) || 0), 0) || 0

    // Average deal size (closed_won)
    const closedDeals = revenueData?.filter((c) => c.stage === 'closed_won') || []
    const avgDealSize = closedDeals.length > 0
      ? closedDeals.reduce((sum, c) => sum + (Number(c.agreed_implementation_cost) || 0), 0) / closedDeals.length
      : 0

    // Conversion rate
    const { count: totalConsultations } = await supabase
      .from('consultation_requests')
      .select('*', { count: 'exact', head: true })

    const conversionRate = totalConsultations && totalConsultations > 0
      ? (closedDeals.length / totalConsultations) * 100
      : 0

    // ============================================
    // 2. ACTIVITY TRACKING
    // ============================================

    // Upcoming meetings (next 7 days)
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

    const { data: upcomingMeetings } = await supabase
      .from('customers')
      .select('id, name, proposal_presentation_datetime, stage')
      .not('proposal_presentation_datetime', 'is', null)
      .gte('proposal_presentation_datetime', new Date().toISOString())
      .lte('proposal_presentation_datetime', sevenDaysFromNow.toISOString())
      .order('proposal_presentation_datetime', { ascending: true })

    // Overdue tasks
    const { data: overdueTasks } = await supabase
      .from('customers')
      .select('id, name, next_action_required, next_action_due_date')
      .not('next_action_due_date', 'is', null)
      .lt('next_action_due_date', new Date().toISOString().split('T')[0])
      .not('stage', 'in', '(closed_won,closed_lost)')

    // Recent consultations (last 24 hours)
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

    const { count: recentConsultations } = await supabase
      .from('consultation_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', twentyFourHoursAgo.toISOString())

    // ============================================
    // 3. PROJECT HEALTH
    // ============================================

    const { data: activeProjects } = await supabase
      .from('customers')
      .select('id, name, stage, project_status, solution_due_date, current_blockers')
      .in('stage', ['project_active', 'implementation', 'delivered'])
      .order('solution_due_date', { ascending: true })

    const onTrackCount = activeProjects?.filter((p) => p.project_status === 'on_track').length || 0
    const atRiskCount = activeProjects?.filter((p) => p.project_status === 'at_risk').length || 0
    const delayedCount = activeProjects?.filter((p) => p.project_status === 'delayed').length || 0
    const blockedCount = activeProjects?.filter((p) => p.project_status === 'blocked').length || 0

    // ============================================
    // 4. COMMUNICATION LOG (Last 7 days)
    // ============================================

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentInteractions } = await supabase
      .from('customer_interactions')
      .select(`
        id,
        interaction_type,
        subject,
        notes,
        interaction_date,
        customer_id,
        customer:customers(id, name),
        created_by_profile:profiles!created_by(id, full_name)
      `)
      .gte('interaction_date', sevenDaysAgo.toISOString())
      .order('interaction_date', { ascending: false })
      .limit(20)

    // ============================================
    // COMBINE ALL METRICS
    // ============================================

    return NextResponse.json({
      success: true,
      data: {
        revenue: {
          ytd: Math.round(ytdRevenue * 100) / 100,
          pipeline: Math.round(pipelineValue * 100) / 100,
          conversion: Math.round(conversionRate * 10) / 10,
          avg_deal: Math.round(avgDealSize * 100) / 100,
        },
        activity: {
          upcoming_meetings: upcomingMeetings || [],
          overdue_count: overdueTasks?.length || 0,
          overdue_tasks: overdueTasks || [],
          recent_consultations: recentConsultations || 0,
        },
        projects: {
          active: activeProjects || [],
          on_track_count: onTrackCount,
          at_risk_count: atRiskCount,
          delayed_count: delayedCount,
          blocked_count: blockedCount,
        },
        interactions: recentInteractions || [],
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
