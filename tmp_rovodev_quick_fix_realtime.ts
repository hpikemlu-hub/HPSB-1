/**
 * Real-time Calendar Subscriptions - Simplified for Netlify build
 * Removed React Query dependency for faster deployment
 */

import { useEffect } from 'react';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import type { CalendarEvent, CalendarTodo } from '@/types';

/**
 * Subscribe to calendar_events table changes
 */
export function useRealtimeCalendar(userId?: string) {
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    // Basic subscription without React Query cache invalidation
    const eventsChannel = supabase
      .channel('calendar-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: userId ? `creator_id=eq.${userId}` : undefined,
        },
        (payload) => {
          console.log('Calendar event change:', payload);
          // For now, just log the change instead of cache invalidation
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [userId, supabase]);
}

/**
 * Subscribe to calendar event participant changes
 */
export function useRealtimeEventParticipants(eventId?: string) {
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    if (!eventId) return;

    const participantsChannel = supabase
      .channel('event-participants-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('Event participant change:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [eventId, supabase]);
}

/**
 * Subscribe to calendar todo changes
 */
export function useRealtimeCalendarTodos(eventId?: string) {
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    if (!eventId) return;

    const todosChannel = supabase
      .channel('calendar-todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_todos',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          console.log('Calendar todo change:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(todosChannel);
    };
  }, [eventId, supabase]);
}

/**
 * Subscribe to workload changes
 */
export function useRealtimeWorkload(userId?: string) {
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    const workloadChannel = supabase
      .channel('workload-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workload',
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          console.log('Workload change:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workloadChannel);
    };
  }, [userId, supabase]);
}