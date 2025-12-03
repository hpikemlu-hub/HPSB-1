import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Calendar-Linked Workload API
 * Fetch workload items linked to calendar events
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
 * GET /api/workload/calendar-linked
 * 
 * Query params:
 * - user_id: Filter by user
 * - event_id: Filter by specific event
 * - auto_completed: Filter by auto-completion status (true/false)
 * - status: Filter by workload status (done, on-progress, pending)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const eventId = searchParams.get('event_id');
    const autoCompleted = searchParams.get('auto_completed');
    const status = searchParams.get('status');

    const supabase = createAdminClient();

    let query = supabase
      .from('calendar_todos')
      .select(`
        id,
        event_id,
        todo_id,
        auto_completed,
        auto_completed_at,
        created_at,
        event:calendar_events(
          id,
          title,
          description,
          event_type,
          is_business_trip,
          start_date,
          end_date,
          location,
          creator:users!calendar_events_creator_id_fkey(
            id, nama_lengkap, jabatan
          )
        ),
        todo:workload(
          id,
          user_id,
          nama,
          type,
          deskripsi,
          status,
          tgl_diterima,
          fungsi,
          created_at,
          updated_at,
          user:users(id, nama_lengkap, jabatan)
        )
      `);

    // Apply filters
    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    if (userId) {
      query = query.eq('todo.user_id', userId);
    }

    if (autoCompleted !== null && autoCompleted !== undefined) {
      query = query.eq('auto_completed', autoCompleted === 'true');
    }

    if (status) {
      query = query.eq('todo.status', status);
    }

    // Order by most recent
    query = query.order('created_at', { ascending: false });

    const { data: linkedWorkload, error } = await query;

    if (error) {
      console.error('Linked workload fetch error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Calculate summary statistics
    const stats = {
      total: linkedWorkload?.length || 0,
      auto_completed: linkedWorkload?.filter(w => w.auto_completed).length || 0,
      pending: linkedWorkload?.filter(w => (w.todo as any)?.status === 'pending').length || 0,
      in_progress: linkedWorkload?.filter(w => (w.todo as any)?.status === 'on-progress').length || 0,
      done: linkedWorkload?.filter(w => (w.todo as any)?.status === 'done').length || 0,
    };

    return NextResponse.json({
      success: true,
      data: linkedWorkload || [],
      stats,
      count: linkedWorkload?.length || 0
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/workload/calendar-linked
 * Unlink a workload item from a calendar event
 * 
 * Query params:
 * - link_id: ID of the calendar_todos link to remove
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('link_id');

    if (!linkId) {
      return NextResponse.json(
        { success: false, error: 'link_id parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('calendar_todos')
      .delete()
      .eq('id', linkId);

    if (error) {
      console.error('Unlink error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workload item unlinked from calendar event'
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
