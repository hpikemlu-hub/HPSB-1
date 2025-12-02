import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Calendar Events API Routes
 * Handles CRUD operations for calendar events
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
 * GET /api/calendar/events - Fetch calendar events
 * Query params:
 * - user_id: Filter by user (creator or participant)
 * - start_date: Filter events starting from this date
 * - end_date: Filter events ending before this date
 * - event_type: Filter by event type
 * - is_business_trip: Filter business trips (true/false)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const eventType = searchParams.get('event_type');
    const isBusinessTrip = searchParams.get('is_business_trip');

    const supabase = createAdminClient();
    
    // If user_id is provided, use the specialized function
    if (userId) {
      const { data, error } = await supabase.rpc('get_user_calendar_events', {
        p_user_id: userId,
        p_start_date: startDate || null,
        p_end_date: endDate || null,
        p_event_type: eventType || null
      });

      if (error) {
        console.error('Calendar events fetch error:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: data || [],
        count: data?.length || 0
      });
    }

    // Otherwise, fetch all events with filters
    let query = supabase
      .from('calendar_events')
      .select(`
        *,
        creator:users!calendar_events_creator_id_fkey(
          id, nama_lengkap, jabatan
        ),
        event_participants(
          id,
          user:users(id, nama_lengkap, jabatan),
          role,
          status
        ),
        calendar_todos(
          id,
          todo:workload(
            id, nama, status, type
          ),
          auto_completed,
          auto_completed_at
        )
      `);

    // Apply filters
    if (startDate) {
      query = query.gte('end_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('start_date', endDate);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (isBusinessTrip !== null) {
      query = query.eq('is_business_trip', isBusinessTrip === 'true');
    }

    // Order by start date
    query = query.order('start_date', { ascending: true });

    const { data: events, error } = await query;

    if (error) {
      console.error('Calendar events fetch error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: events || [],
      count: events?.length || 0
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
 * POST /api/calendar/events - Create new calendar event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      creator_id,
      title,
      description,
      event_type = 'other',
      is_business_trip = false,
      is_all_day = false,
      start_date,
      end_date,
      location,
      dipa,
      color = '#0d6efd',
      notes,
      budget_amount,
      budget_source,
      participants = [], // Array of { user_id, role }
      linked_todos = [] // Array of todo IDs to link
    } = body;

    // Validate required fields
    if (!creator_id || !title || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Creator ID, title, start_date, dan end_date harus diisi' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { success: false, error: 'End date tidak boleh lebih awal dari start date' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Start transaction-like operations
    // 1. Create the event
    const eventData = {
      creator_id,
      title,
      description,
      event_type,
      is_business_trip,
      is_all_day,
      start_date,
      end_date,
      location,
      dipa,
      color,
      notes,
      budget_amount,
      budget_source
    };

    const { data: newEvent, error: eventError } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();

    if (eventError) {
      console.error('Event creation error:', eventError);
      return NextResponse.json(
        { success: false, error: eventError.message },
        { status: 500 }
      );
    }

    // 2. Add participants if provided
    if (participants.length > 0) {
      const participantData = participants.map((p: any) => ({
        event_id: newEvent.id,
        user_id: p.user_id,
        role: p.role || 'participant',
        status: p.status || 'pending'
      }));

      const { error: participantError } = await supabase
        .from('event_participants')
        .insert(participantData);

      if (participantError) {
        console.error('Participant creation error:', participantError);
        // Don't fail the whole operation, just log it
      }
    }

    // 3. Link todos if provided
    if (linked_todos.length > 0) {
      const todoLinks = linked_todos.map((todoId: string) => ({
        event_id: newEvent.id,
        todo_id: todoId
      }));

      const { error: todoLinkError } = await supabase
        .from('calendar_todos')
        .insert(todoLinks);

      if (todoLinkError) {
        console.error('Todo linking error:', todoLinkError);
        // Don't fail the whole operation, just log it
      }
    }

    // 4. Fetch complete event data
    const { data: completeEvent } = await supabase
      .from('calendar_events')
      .select(`
        *,
        creator:users!calendar_events_creator_id_fkey(
          id, nama_lengkap, jabatan
        ),
        event_participants(
          id,
          user:users(id, nama_lengkap, jabatan),
          role,
          status
        ),
        calendar_todos(
          id,
          todo:workload(
            id, nama, status, type
          )
        )
      `)
      .eq('id', newEvent.id)
      .single();

    return NextResponse.json({
      success: true,
      data: completeEvent || newEvent,
      message: `Event "${newEvent.title}" berhasil dibuat`
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
