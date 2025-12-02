/**
 * Calendar API - Supabase Integration
 * Real-time calendar events CRUD operations
 */

import { supabase, TABLES } from '@/lib/supabase/client';
import type { CalendarEvent, CalendarEventForm } from '@/types';

/**
 * Fetch all calendar events
 */
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from(TABLES.CALENDAR_EVENTS)
    .select(`
      *,
      creator:users!calendar_events_creator_id_fkey(*)
    `)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching calendar events:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch calendar events for a specific user
 */
export async function fetchUserCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from(TABLES.CALENDAR_EVENTS)
    .select(`
      *,
      creator:users!calendar_events_creator_id_fkey(*)
    `)
    .or(`creator_id.eq.${userId},participants.cs.{${userId}}`)
    .order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching user calendar events:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch a single calendar event by ID
 */
export async function fetchCalendarEventById(id: string): Promise<CalendarEvent | null> {
  const { data, error } = await supabase
    .from(TABLES.CALENDAR_EVENTS)
    .select(`
      *,
      creator:users!calendar_events_creator_id_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching calendar event:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Create a new calendar event (legacy method)
 */
export async function createCalendarEvent(
  eventData: CalendarEventForm,
  creatorId: string
): Promise<CalendarEvent> {
  // Map UI-only field `category` to DB field `event_type` and strip `category`
  const { category, ...rest } = (eventData as any) || {};
  let payload: any = { ...rest };
  if (category && !payload.event_type) payload.event_type = category;

  // First attempt: with event_type (if present)
  let { data, error } = await supabase
    .from(TABLES.CALENDAR_EVENTS)
    .insert({
      ...payload,
      creator_id: creatorId,
    })
    .select(`
      *,
      creator:users!calendar_events_creator_id_fkey(*)
    `)
    .single();

  // If schema doesn't have event_type, retry without it
  if (error && String((error as any)?.message || '').includes("'event_type'")) {
    const { event_type, ...withoutEventType } = payload;
    const retry = await supabase
      .from(TABLES.CALENDAR_EVENTS)
      .insert({
        ...withoutEventType,
        creator_id: creatorId,
      })
      .select(`
        *,
        creator:users!calendar_events_creator_id_fkey(*)
      `)
      .single();

    data = retry.data as any;
    error = retry.error as any;
  }

  if (error) {
    const msg = (error as any)?.message || 'Failed to create calendar event';
    console.error('Error creating calendar event:', msg);
    throw new Error(msg);
  }

  return data as CalendarEvent;
}

/**
 * Create a new calendar event with auto-todo generation (enhanced)
 */
export async function createCalendarEventEnhanced(
  eventData: CalendarEventForm,
  creatorId: string
): Promise<CalendarEvent> {
  const response = await fetch('/api/calendar/events/enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...eventData,
      creator_id: creatorId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create calendar event');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Update an existing calendar event
 */
export async function updateCalendarEvent(
  id: string,
  eventData: Partial<CalendarEventForm>
): Promise<CalendarEvent> {
  // Map UI-only `category` to `event_type` and strip `category` before update
  const { category, ...rest } = (eventData as any) || {};
  let payload: any = { ...rest };
  if (category) payload.event_type = category;

  // First attempt: with event_type if present
  let { data, error } = await supabase
    .from(TABLES.CALENDAR_EVENTS)
    .update(payload)
    .eq('id', id)
    .select(`
      *,
      creator:users!calendar_events_creator_id_fkey(*)
    `)
    .single();

  // If schema doesn't have event_type, retry without it
  if (error && String((error as any)?.message || '').includes("'event_type'")) {
    const { event_type, ...withoutEventType } = payload;
    const retry = await supabase
      .from(TABLES.CALENDAR_EVENTS)
      .update(withoutEventType)
      .eq('id', id)
      .select(`
        *,
        creator:users!calendar_events_creator_id_fkey(*)
      `)
      .single();
    data = retry.data as any;
    error = retry.error as any;
  }

  if (error) {
    const msg = (error as any)?.message || 'Failed to update calendar event';
    console.error('Error updating calendar event:', msg);
    throw new Error(msg);
  }

  return data as CalendarEvent;
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  const response = await fetch(`/api/calendar/events/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    try {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete calendar event');
    } catch {
      throw new Error('Failed to delete calendar event');
    }
  }
}

/**
 * Fetch ongoing calendar events (trips in progress)
 */
export async function fetchOngoingEvents(userId?: string): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  
  let query = supabase
    .from(TABLES.CALENDAR_EVENTS)
    .select(`
      *,
      creator:users!calendar_events_creator_id_fkey(*)
    `)
    .lte('start_date', now)
    .gte('end_date', now);

  if (userId) {
    query = query.or(`creator_id.eq.${userId},participants.cs.{${userId}}`);
  }

  const { data, error } = await query.order('start_date', { ascending: true });

  if (error) {
    console.error('Error fetching ongoing events:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch upcoming calendar events
 */
export async function fetchUpcomingEvents(userId?: string, limit = 5): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  
  let query = supabase
    .from(TABLES.CALENDAR_EVENTS)
    .select(`
      *,
      creator:users!calendar_events_creator_id_fkey(*)
    `)
    .gt('start_date', now);

  if (userId) {
    query = query.or(`creator_id.eq.${userId},participants.cs.{${userId}}`);
  }

  const { data, error } = await query
    .order('start_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming events:', error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Fetch all unique locations from calendar events (for auto-suggest)
 */
export async function fetchUniqueLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLES.CALENDAR_EVENTS)
    .select('location')
    .not('location', 'is', null)
    .order('location');

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  // Get unique locations
  const locations = [...new Set(data.map(item => item.location).filter(Boolean) as string[])];
  return locations;
}

/**
 * Fetch all unique DIPA codes from calendar events
 */
export async function fetchUniqueDipaCodes(): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLES.CALENDAR_EVENTS)
    .select('dipa')
    .not('dipa', 'is', null)
    .order('dipa');

  if (error) {
    console.error('Error fetching DIPA codes:', error);
    return [];
  }

  // Get unique DIPA codes
  const dipaCodes = [...new Set(data.map(item => item.dipa).filter(Boolean) as string[])];
  return dipaCodes;
}

/**
 * Fetch all unique categories (event_type) from calendar events
 */
export async function fetchUniqueCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from(TABLES.CALENDAR_EVENTS)
      .select('event_type')
      .not('event_type', 'is', null)
      .order('event_type');

    if (error) {
      // Silent fallback for RLS/no-column environments
      return [];
    }

    const categories = [...new Set((data || []).map((item: any) => item.event_type).filter(Boolean) as string[])];
    return categories;
  } catch {
    // Silent fallback
    return [];
  }
}

/**
 * Fetch workload items linked to calendar events
 */
export async function fetchCalendarLinkedWorkload(filters?: {
  user_id?: string;
  event_id?: string;
  auto_completed?: boolean;
  status?: string;
}): Promise<any[]> {
  const params = new URLSearchParams();
  
  if (filters?.user_id) params.append('user_id', filters.user_id);
  if (filters?.event_id) params.append('event_id', filters.event_id);
  if (filters?.auto_completed !== undefined) params.append('auto_completed', String(filters.auto_completed));
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`/api/workload/calendar-linked?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch calendar-linked workload');
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Trigger auto-completion of business trips
 */
export async function triggerAutoComplete(dryRun: boolean = false): Promise<any> {
  const response = await fetch('/api/calendar/auto-complete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dry_run: dryRun }),
  });

  if (!response.ok) {
    throw new Error('Failed to trigger auto-completion');
  }

  return await response.json();
}

/**
 * Fetch auto-completion logs
 */
export async function fetchAutoCompleteLogs(limit: number = 20, status?: string): Promise<any[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status) params.append('status', status);

  const response = await fetch(`/api/calendar/auto-complete?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch auto-completion logs');
  }

  const result = await response.json();
  return result.data?.logs || [];
}
