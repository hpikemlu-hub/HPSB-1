import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Enhanced Calendar Events API Routes
 * Handles event creation with automatic todo generation and participant management
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
 * POST /api/calendar/events/enhanced - Create event with auto-todo generation
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
      participants = [], // Legacy array of user_ids
      event_participants = [], // New structured participants: [{ user_id, role, status }]
      auto_create_todos = true,
      todo_template,
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

    // Step 1: Create the event
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
      budget_source,
      participants, // Keep legacy field for backward compatibility
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

    // Step 2: Add structured participants
    const participantsToAdd = event_participants.length > 0 
      ? event_participants 
      : participants.map((userId: string) => ({
          user_id: userId,
          role: 'participant' as const,
          status: 'pending' as const
        }));

    let addedParticipants: any[] = [];
    if (participantsToAdd.length > 0) {
      const participantData = participantsToAdd.map((p: any) => ({
        event_id: newEvent.id,
        user_id: p.user_id,
        role: p.role || 'participant',
        status: p.status || 'pending'
      }));

      const { data: participants, error: participantError } = await supabase
        .from('event_participants')
        .insert(participantData)
        .select('*, user:users(id, nama_lengkap, jabatan)');

      if (participantError) {
        console.error('Participant creation error:', participantError);
        // Don't fail the whole operation, but log it
      } else {
        addedParticipants = participants || [];
      }
    }

    // Step 3: Auto-create todos for business trips
    const createdTodos: any[] = [];
    if (is_business_trip && auto_create_todos && participantsToAdd.length > 0) {
      // Get all participant user IDs
      const participantUserIds = participantsToAdd.map((p: any) => p.user_id);
      
      // Fetch user details to create personalized todos
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, nama_lengkap')
        .in('id', participantUserIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
      } else if (users) {
        // Create todos for each participant
        const todosToCreate = users.map(user => {
          const todoName = todo_template?.nama || `Perjalanan Dinas: ${title}`;
          const todoDeskripsi = todo_template?.deskripsi || 
            `Perjalanan dinas ke ${location || 'lokasi'} dari ${start_date} sampai ${end_date}. ${description || ''}`;
          
          return {
            user_id: user.id,
            nama: `${todoName} - ${user.nama_lengkap}`,
            type: todo_template?.type || 'Perjalanan Dinas',
            deskripsi: todoDeskripsi,
            status: 'on-progress' as const,
            tgl_diterima: new Date().toISOString().split('T')[0],
            fungsi: todo_template?.fungsi || 'NON FUNGSI',
          };
        });

        const { data: newTodos, error: todosError } = await supabase
          .from('workload')
          .insert(todosToCreate)
          .select();

        if (todosError) {
          console.error('Todo creation error:', todosError);
        } else if (newTodos) {
          createdTodos.push(...newTodos);

          // Step 4: Link todos to calendar event
          const todoLinks = newTodos.map(todo => ({
            event_id: newEvent.id,
            todo_id: todo.id,
            auto_completed: false,
          }));

          const { error: linkError } = await supabase
            .from('calendar_todos')
            .insert(todoLinks);

          if (linkError) {
            console.error('Todo linking error:', linkError);
          }
        }
      }
    }

    // Step 5: Fetch complete event data with all relations
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
            id, nama, status, type, user_id
          ),
          auto_completed,
          auto_completed_at
        )
      `)
      .eq('id', newEvent.id)
      .single();

    return NextResponse.json({
      success: true,
      data: completeEvent || newEvent,
      metadata: {
        participants_added: addedParticipants.length,
        todos_created: createdTodos.length,
      },
      message: `Event "${newEvent.title}" berhasil dibuat dengan ${addedParticipants.length} peserta dan ${createdTodos.length} tugas.`
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
 * GET /api/calendar/events/enhanced - Fetch events with full relations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const eventType = searchParams.get('event_type');
    const isBusinessTrip = searchParams.get('is_business_trip');
    const includeCompleted = searchParams.get('include_completed') !== 'false';

    const supabase = createAdminClient();
    
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
            id, nama, status, type, user_id, deskripsi, tgl_diterima
          ),
          auto_completed,
          auto_completed_at
        )
      `);

    // Apply filters
    if (userId) {
      // Filter by user as creator or participant
      query = query.or(`creator_id.eq.${userId},event_participants.user_id.eq.${userId}`);
    }

    if (startDate) {
      query = query.gte('end_date', startDate);
    }
    
    if (endDate) {
      query = query.lte('start_date', endDate);
    }

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (isBusinessTrip !== null && isBusinessTrip !== undefined) {
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

    // Filter out completed todos if requested
    let filteredEvents = events;
    if (!includeCompleted && events) {
      filteredEvents = events.map(event => ({
        ...event,
        calendar_todos: event.calendar_todos?.filter(
          (ct: any) => !ct.auto_completed
        ) || []
      }));
    }

    return NextResponse.json({
      success: true,
      data: filteredEvents || [],
      count: filteredEvents?.length || 0
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
