import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { validateJarvisApiKey, unauthorizedResponse } from '@/lib/jarvis-auth';

/**
 * GET /api/jarvis/customers/[id]
 *
 * Returns a single customer by Supabase UUID or customer_number.
 * Accepts either format in the [id] parameter.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateJarvisApiKey(request)) {
    return unauthorizedResponse();
  }

  try {
    const { id } = await params;
    const supabase = createAdminClient();

    // Determine if id is a UUID or a customer_number
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let query = supabase
      .from('customers')
      .select(
        '*, assigned_admin:profiles!assigned_admin_id(id, full_name, email)'
      );

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('customer_number', id);
    }

    const { data: customer, error } = await query.single();

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Get recent interactions
    const { data: interactions } = await supabase
      .from('customer_interactions')
      .select('id, interaction_type, subject, notes, phase, interaction_date, created_at')
      .eq('customer_id', customer.id)
      .order('interaction_date', { ascending: false })
      .limit(10);

    // Get open action items
    const { data: actionItems } = await supabase
      .from('customer_action_items')
      .select('id, title, phase, status, priority, due_date, assigned_label')
      .eq('customer_id', customer.id)
      .eq('status', 'open')
      .order('due_date', { ascending: true });

    return NextResponse.json({
      customer: {
        ...customer,
        recent_interactions: interactions || [],
        open_action_items: actionItems || [],
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
