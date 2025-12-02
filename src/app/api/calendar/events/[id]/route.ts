import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Calendar Events API Routes - Single Event Operations
 * Handles GET, PUT, DELETE for individual events
 */

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
 * GET /api/calendar/events/[id] - Get single event with full details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Use the get_event_details function for complete data
    const { data, error } = await supabase.rpc('get_event_details', {
      p_event_id: id
    });

    if (error) {
      console.error('Event fetch error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || !data.event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
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
 * PUT /api/calendar/events/[id] - Update event
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const {
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
      participants,
      linked_todos
    } = body;

    // Validate dates if provided
    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { success: false, error: 'End date cannot be earlier than start date' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('calendar_events')
      .select('id, creator_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update event
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (event_type !== undefined) updateData.event_type = event_type;
    if (is_business_trip !== undefined) updateData.is_business_trip = is_business_trip;
    if (is_all_day !== undefined) updateData.is_all_day = is_all_day;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (location !== undefined) updateData.location = location;
    if (dipa !== undefined) updateData.dipa = dipa;
    if (color !== undefined) updateData.color = color;
    if (notes !== undefined) updateData.notes = notes;
    if (budget_amount !== undefined) updateData.budget_amount = budget_amount;
    if (budget_source !== undefined) updateData.budget_source = budget_source;

    const { error: updateError } = await supabase
      .from('calendar_events')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('Event update error:', updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    // Update participants if provided
    if (participants !== undefined && Array.isArray(participants)) {
      // Delete existing participants
      await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', id);

      // Insert new participants
      if (participants.length > 0) {
        const participantData = participants.map((p: any) => ({
          event_id: id,
          user_id: p.user_id,
          role: p.role || 'participant',
          status: p.status || 'pending'
        }));

        await supabase
          .from('event_participants')
          .insert(participantData);
      }
    }

    // Update linked todos if provided
    if (linked_todos !== undefined && Array.isArray(linked_todos)) {
      // Delete existing links
      await supabase
        .from('calendar_todos')
        .delete()
        .eq('event_id', id);

      // Insert new links
      if (linked_todos.length > 0) {
        const todoLinks = linked_todos.map((todoId: string) => ({
          event_id: id,
          todo_id: todoId
        }));

        await supabase
          .from('calendar_todos')
          .insert(todoLinks);
      }
    }

    // Fetch updated event
    const { data: updatedEvent } = await supabase.rpc('get_event_details', {
      p_event_id: id
    });

    return NextResponse.json({
      success: true,
      data: updatedEvent,
      message: 'Event updated successfully'
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
 * DELETE /api/calendar/events/[id] - Delete event
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if event exists
    const { data: existingEvent, error: fetchError } = await supabase
      .from('calendar_events')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete event (cascade will handle participants and todos)
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Event delete error:', deleteError);
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Event "${existingEvent.title}" deleted successfully`
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
