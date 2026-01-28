import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * POST /api/jarvis/mark-read
 *
 * Batch mark communications as read.
 *
 * Request body:
 *   - ids: string[] (communication IDs to mark as read)
 *   - type: 'voicemail' | 'sms' | 'all' (optional, filter by type)
 */
export async function POST(request: NextRequest) {
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const { ids, type } = body;

    // Validate request
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      );
    }

    if (ids.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 ids allowed per request' },
        { status: 400 }
      );
    }

    // Build update query
    let query = supabase
      .from('communications')
      .update({ status: 'read' })
      .in('id', ids);

    // Optionally filter by type
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { error, count } = await query.select('id');

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update communications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated_count: count || 0,
    });
  } catch (error) {
    console.error('Jarvis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
