import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * GET /api/jarvis/consultations
 *
 * Returns consultation requests with optional filtering.
 *
 * Query params:
 *   - limit: number (default 10, max 50)
 *   - pending_only: boolean (exclude converted)
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
    const pendingOnly = searchParams.get('pending_only') === 'true';
    const since = searchParams.get('since');

    // Build query
    let query = supabase
      .from('consultation_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (pendingOnly) {
      query = query.neq('status', 'converted');
    }

    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch consultations' },
        { status: 500 }
      );
    }

    // Get pending count
    const { count: pendingCount } = await supabase
      .from('consultation_requests')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'converted');

    return NextResponse.json({
      consultations: data || [],
      total: count || 0,
      pending_count: pendingCount || 0,
    });
  } catch (error) {
    console.error('Jarvis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
