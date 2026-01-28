import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * GET /api/jarvis/sms
 *
 * Returns SMS messages with optional filtering.
 *
 * Query params:
 *   - limit: number (default 10, max 50)
 *   - unread_only: boolean
 *   - since: ISO date string (filter items after this date)
 */
export async function GET(request: NextRequest) {
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const since = searchParams.get('since');

    // Build query
    let query = supabase
      .from('communications')
      .select(
        'id, from_address, from_name, to_address, body, status, direction, twilio_message_sid, created_at, customer:customers!customer_id(id, name, email, phone)',
        { count: 'exact' }
      )
      .eq('type', 'sms')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('status', 'unread');
    }

    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch SMS messages' },
        { status: 500 }
      );
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('communications')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'sms')
      .eq('status', 'unread');

    return NextResponse.json({
      sms: data || [],
      total: count || 0,
      unread_count: unreadCount || 0,
    });
  } catch (error) {
    console.error('Jarvis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
