import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfNDaysAgo(n: number): Date {
  const d = startOfToday();
  d.setDate(d.getDate() - n);
  return d;
}

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();

    // Fetch workload rows minimal fields
    const { data: workloads, error: wlErr } = await supabase
      .from('workload')
      .select('status, created_at, tgl_diterima');

    if (wlErr) {
      return NextResponse.json({ success: false, error: wlErr.message || 'Failed to fetch workload' }, { status: 500 });
    }

    const total = workloads?.length || 0;
    const doneTotal = workloads?.filter(w => w.status === 'done').length || 0;
    const onProgressTotal = workloads?.filter(w => w.status === 'on-progress').length || 0;
    const pendingTotal = workloads?.filter(w => w.status === 'pending').length || 0;

    // Week windows based on tgl_diterima (as requested)
    const weekStart = startOfNDaysAgo(7).getTime();
    const prevWeekStart = startOfNDaysAgo(14).getTime();

    const toTime = (s?: string | null) => (s ? new Date(s).getTime() : NaN);

    const weekly = (workloads || []).filter(w => {
      const t = toTime((w as any).tgl_diterima);
      return !isNaN(t) && t >= weekStart;
    });

    const prevWeekly = (workloads || []).filter(w => {
      const t = toTime((w as any).tgl_diterima);
      return !isNaN(t) && t >= prevWeekStart && t < weekStart;
    });

    const weeklyTotal = weekly.length;
    const weeklyDone = weekly.filter(w => w.status === 'done').length;
    const prevWeeklyTotal = prevWeekly.length || 0;

    const completionRate = total > 0 ? Math.round((doneTotal / total) * 100) : 0;
    const efficiencyScore = weeklyTotal > 0 ? Math.round((weeklyDone / weeklyTotal) * 100) : 0;

    // Productivity percent vs previous week (fallback 0 if prev=0)
    const weeklyProductivityPercent = prevWeeklyTotal > 0
      ? Math.round(((weeklyTotal - prevWeeklyTotal) / prevWeeklyTotal) * 100)
      : 0;

    // Total active users
    const { data: users, error: uErr } = await supabase.from('users').select('id').eq('is_active', true);
    if (uErr) {
      return NextResponse.json({ success: false, error: uErr.message || 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          total,
          doneTotal,
          onProgressTotal,
          pendingTotal,
        },
        weekly: {
          weeklyTotal,
          weeklyDone,
          prevWeeklyTotal,
          weeklyProductivityPercent,
        },
        rates: {
          completionRate,
          efficiencyScore,
        },
        users: {
          activeUsers: users?.length || 0,
        },
      },
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}
