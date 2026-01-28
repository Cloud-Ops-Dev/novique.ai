import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * GET /api/jarvis/communications
 *
 * Returns a summary of all incoming customer communications and leads.
 * Includes: voicemails, SMS, consultation requests, and ROI assessments.
 */
export async function GET(request: Request) {
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();

    // Get all counts in parallel
    const [
      { count: totalVoicemail },
      { count: unreadVoicemail },
      { count: totalSms },
      { count: unreadSms },
      { count: totalConsultations },
      { count: pendingConsultations },
      { count: totalRoiAssessments },
      { count: unconvertedRoiAssessments },
    ] = await Promise.all([
      // Voicemails
      supabase
        .from('communications')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'voicemail'),
      supabase
        .from('communications')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'voicemail')
        .eq('status', 'unread'),
      // SMS
      supabase
        .from('communications')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'sms'),
      supabase
        .from('communications')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'sms')
        .eq('status', 'unread'),
      // Consultation requests
      supabase
        .from('consultation_requests')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('consultation_requests')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'converted'),
      // ROI assessments
      supabase
        .from('roi_assessments')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('roi_assessments')
        .select('*', { count: 'exact', head: true })
        .or('converted.is.null,converted.eq.false'),
    ]);

    // Get recent items (3 most recent of each type)
    const [
      { data: recentVoicemails },
      { data: recentSms },
      { data: recentConsultations },
      { data: recentRoiAssessments },
    ] = await Promise.all([
      supabase
        .from('communications')
        .select('id, from_address, from_name, body, status, created_at, customer:customers!customer_id(id, name)')
        .eq('type', 'voicemail')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('communications')
        .select('id, from_address, from_name, body, status, created_at, customer:customers!customer_id(id, name)')
        .eq('type', 'sms')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('consultation_requests')
        .select('id, name, email, company, message, status, created_at')
        .neq('status', 'converted')
        .order('created_at', { ascending: false })
        .limit(3),
      supabase
        .from('roi_assessments')
        .select('id, email, segment, plan_id, annual_savings, contacted, converted, created_at')
        .or('converted.is.null,converted.eq.false')
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

    // Calculate total action items (things needing attention)
    const totalActionItems =
      (unreadVoicemail || 0) +
      (unreadSms || 0) +
      (pendingConsultations || 0) +
      (unconvertedRoiAssessments || 0);

    return NextResponse.json({
      voicemails: {
        total: totalVoicemail || 0,
        unread: unreadVoicemail || 0,
        recent: recentVoicemails || [],
      },
      sms: {
        total: totalSms || 0,
        unread: unreadSms || 0,
        recent: recentSms || [],
      },
      consultations: {
        total: totalConsultations || 0,
        pending: pendingConsultations || 0,
        recent: recentConsultations || [],
      },
      roi_assessments: {
        total: totalRoiAssessments || 0,
        unconverted: unconvertedRoiAssessments || 0,
        recent: recentRoiAssessments || [],
      },
      summary: {
        total_action_items: totalActionItems,
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Jarvis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
