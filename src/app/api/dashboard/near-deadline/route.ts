import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// GET /api/dashboard/near-deadline?hours=24
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const hoursParam = url.searchParams.get('hours');
    const hours = Math.max(1, Math.min(168, Number(hoursParam) || 24)); // limit 1..168 hours

    const supabase = createAdminSupabaseClient();

    const now = new Date();
    const until = new Date(now.getTime() + hours * 60 * 60 * 1000);

    // Fetch minimal fields server-side (bypass RLS using service role)
    // Note: Using tgl_diterima as deadline since tgl_deadline column doesn't exist yet
    // TODO: Add tgl_deadline column to database and update this query
    const { data, error } = await supabase
      .from('workload')
      .select('id, status, tgl_diterima, created_at')
      .neq('status', 'done');

    if (error) {
      console.error('near-deadline fetch error:', error);
      return NextResponse.json({ success: false, error: error.message || 'Database error' }, { status: 500 });
    }

    const count = (data || []).filter((w) => {
      // Use tgl_diterima + 7 days as estimated deadline for now
      // This is a temporary fix until tgl_deadline column is added
      if (!w.tgl_diterima) return false;
      const receivedDate = new Date(w.tgl_diterima as string);
      const estimatedDeadline = new Date(receivedDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 days
      return estimatedDeadline >= now && estimatedDeadline <= until;
    }).length;

    return NextResponse.json({ success: true, data: { count } });
  } catch (e: any) {
    console.error('near-deadline unexpected error:', e);
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
