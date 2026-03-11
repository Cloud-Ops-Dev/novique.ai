import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * GET /api/jarvis/customers
 *
 * Returns customers with optional filtering.
 *
 * Query params:
 *   - search: string (matches name, email, business_type, customer_number)
 *   - customer_number: string (exact match)
 *   - stage: string (e.g. proposal_development, agreement, delivery, implementation)
 *   - status: string (project_status: on_track, at_risk, blocked, completed)
 *   - limit: number (default 10, max 50)
 *   - offset: number (default 0)
 */
export async function GET(request: NextRequest) {
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);

    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const customerNumber = searchParams.get('customer_number');
    const stage = searchParams.get('stage');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('customers')
      .select(
        'id, name, email, phone, business_type, customer_number, stage, project_status, is_test, created_at, assigned_admin:profiles!assigned_admin_id(id, full_name)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (customerNumber) {
      query = query.eq('customer_number', customerNumber);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,business_type.ilike.%${search}%,customer_number.ilike.%${search}%`
      );
    }

    if (stage) {
      query = query.eq('stage', stage);
    }

    if (status) {
      query = query.eq('project_status', status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customers: data || [],
      total: count || 0,
    });
  } catch (error) {
    console.error('Jarvis API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
