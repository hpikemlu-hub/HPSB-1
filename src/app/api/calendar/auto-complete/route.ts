import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Auto-Complete Business Trips API
 * Manually trigger or check auto-completion of expired business trips
 */

// Create admin client for server-side operations
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

/**
 * POST /api/calendar/auto-complete
 * Trigger auto-completion of business trips
 * 
 * Request body:
 * - dry_run: boolean (optional) - If true, only return what would be completed
 * - authorization: Bearer token for cron job authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If CRON_SECRET is set, require authentication
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { dry_run = false } = body;

    const supabase = createAdminClient();

    if (dry_run) {
      // Dry run - just return what would be completed
      const { data: eventsToComplete, error } = await supabase
        .from('calendar_events')
        .select(`
          id,
          title,
          end_date,
          calendar_todos(
            id,
            todo:workload(id, nama, status, user_id)
          )
        `)
        .eq('is_business_trip', true)
        .lt('end_date', new Date().toISOString())
        .not('calendar_todos.auto_completed', 'eq', true);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        dry_run: true,
        data: {
          events_to_process: eventsToComplete?.length || 0,
          events: eventsToComplete,
        },
        message: `Would complete ${eventsToComplete?.length || 0} events`
      });
    }

    // Actually run auto-completion
    const { data: results, error } = await supabase.rpc('auto_complete_business_trips');

    if (error) {
      console.error('Auto-complete error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Broadcast real-time update
    try {
      await supabase.channel('calendar-updates').send({
        type: 'broadcast',
        event: 'todos-auto-completed',
        payload: { results }
      });
    } catch (broadcastError) {
      console.error('Broadcast error:', broadcastError);
      // Don't fail the request if broadcast fails
    }

    // Calculate summary
    const summary = {
      events_processed: results?.length || 0,
      todos_completed: results?.reduce((sum: number, r: any) => sum + (r.todos_completed || 0), 0) || 0,
      successful: results?.filter((r: any) => r.status === 'success').length || 0,
      partial: results?.filter((r: any) => r.status === 'partial').length || 0,
      failed: results?.filter((r: any) => r.status === 'failed').length || 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        events: results,
      },
      timestamp: new Date().toISOString(),
      message: `Auto-completed ${summary.todos_completed} todos from ${summary.events_processed} events`
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/calendar/auto-complete
 * Check status of auto-completion logs
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // success, partial, failed

    const supabase = createAdminClient();

    let query = supabase
      .from('auto_complete_log')
      .select('*')
      .order('execution_time', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: logs, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total_logs: logs?.length || 0,
      total_events_processed: logs?.length || 0,
      total_todos_completed: logs?.reduce((sum, log) => sum + (log.todos_completed || 0), 0) || 0,
      success_rate: logs?.length 
        ? (logs.filter(log => log.status === 'success').length / logs.length * 100).toFixed(2) + '%'
        : 'N/A'
    };

    return NextResponse.json({
      success: true,
      data: {
        logs,
        stats
      }
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
