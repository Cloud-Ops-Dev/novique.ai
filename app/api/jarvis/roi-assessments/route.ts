import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * GET /api/jarvis/roi-assessments
 *
 * Returns ROI assessment submissions with optional filtering.
 *
 * Query params:
 *   - limit: number (default 10, max 50)
 *   - unconverted_only: boolean (exclude converted)
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
    const unconvertedOnly = searchParams.get('unconverted_only') === 'true';
    const since = searchParams.get('since');

    // Build query
    let query = supabase
      .from('roi_assessments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unconvertedOnly) {
      query = query.or('converted.is.null,converted.eq.false');
    }

    if (since) {
      query = query.gte('created_at', since);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ROI assessments' },
        { status: 500 }
      );
    }

    // Get unconverted count
    const { count: unconvertedCount } = await supabase
      .from('roi_assessments')
      .select('*', { count: 'exact', head: true })
      .or('converted.is.null,converted.eq.false');

    return NextResponse.json({
      roi_assessments: data || [],
      total: count || 0,
      unconverted_count: unconvertedCount || 0,
    });
  } catch (error) {
    console.error('Jarvis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
