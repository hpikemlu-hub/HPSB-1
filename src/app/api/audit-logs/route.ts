import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// GET /api/audit-logs?range=24h|7days|30days|all
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const range = (url.searchParams.get('range') || '7days').toLowerCase();

    const supabase = createAdminSupabaseClient();

    // Fetch newest-first from audit_log using service role (bypass RLS for admin)
    const { data, error } = await supabase
      .from('audit_log')
      .select('id, timestamp, created_at, user_id, user_name, action, resource_type, resource_id, resource_title, details, ip_address, user_agent, severity, status, changes')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('API/audit-logs fetch error:', error);
      return NextResponse.json({ success: false, error: error.message || 'Database error' }, { status: 500 });
    }

    let logs = (data || []) as any[];

    // Normalize timestamp field: prefer `timestamp`, fallback to `created_at`
    logs = logs.map((l) => ({
      ...l,
      timestamp: l.timestamp ?? l.created_at,
    }));

    // Apply server-side range filter for efficiency
    if (range !== 'all') {
      const now = Date.now();
      let cutoff: number | null = null;
      if (range === '24h') cutoff = now - 24 * 60 * 60 * 1000;
      else if (range === '7days') cutoff = now - 7 * 24 * 60 * 60 * 1000;
      else if (range === '30days') cutoff = now - 30 * 24 * 60 * 60 * 1000;

      if (cutoff) {
        logs = logs.filter((l) => {
          const t = new Date(l.timestamp as string).getTime();
          return !isNaN(t) && t >= cutoff!;
        });
      }
    }

    return NextResponse.json({ success: true, data: logs });
  } catch (e: any) {
    console.error('API/audit-logs unexpected error:', e);
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
