/**
 * Real-time Calendar Subscriptions
 * Listens to database changes and updates React Query cache
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClientSupabaseClient } from '@/lib/supabase/client';
import { calendarKeys } from '@/lib/queries/calendar';
import type { CalendarEvent, CalendarTodo } from '@/types';

/**
 * Subscribe to calendar_events table changes
 */
export function useRealtimeCalendar(userId?: string) {
  const queryClient = useQueryClient();
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    // Subscribe to calendar_events changes
    const eventsChannel = supabase
      .channel('calendar-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
        },
        (payload) => {
          console.log('Calendar event changed:', payload);
          
          // Invalidate all calendar queries
          queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
          
          // Invalidate user-specific queries if userId provided
          if (userId) {
            queryClient.invalidateQueries({ 
              queryKey: calendarKeys.userEvents(userId) 
            });
            queryClient.invalidateQueries({
              queryKey: calendarKeys.ongoingEvents(userId)
            });
            queryClient.invalidateQueries({
              queryKey: calendarKeys.upcomingEvents(userId)
            });
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(eventsChannel);
    };
  }, [userId, queryClient, supabase]);
}

/**
 * Subscribe to event_participants table changes
 * For real-time participant updates
 */
export function useRealtimeEventParticipants(eventId?: string) {
  const queryClient = useQueryClient();
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
          console.log('Event participant changed:', payload);
          
          // Invalidate specific event query to reload with new participants
          queryClient.invalidateQueries({ queryKey: calendarKeys.event(eventId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(participantsChannel);
    };
  }, [eventId, queryClient, supabase]);
}

/**
 * Subscribe to calendar_todos table changes
 * For real-time todo linkage updates
 */
export function useRealtimeCalendarTodos(userId?: string) {
  const queryClient = useQueryClient();
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    const todosChannel = supabase
      .channel('calendar-todos-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_todos',
        },
        (payload) => {
          console.log('Calendar todo link changed:', payload);
          
          // Invalidate calendar queries
          queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
          
          // Invalidate workload queries (if you have them)
          queryClient.invalidateQueries({ queryKey: ['workload'] });
          
          if (userId) {
            queryClient.invalidateQueries({ 
              queryKey: calendarKeys.userEvents(userId) 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(todosChannel);
    };
  }, [userId, queryClient, supabase]);
}

/**
 * Subscribe to workload table changes
 * For real-time todo status updates
 */
export function useRealtimeWorkload(userId?: string) {
  const queryClient = useQueryClient();
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    const workloadChannel = supabase
      .channel('workload-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'workload',
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          console.log('Workload changed:', payload);
          
          // Invalidate workload queries
          queryClient.invalidateQueries({ queryKey: ['workload'] });
          
          // If todo status changed, might affect calendar todos
          if (payload.new && payload.old && payload.new.status !== payload.old.status) {
            queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(workloadChannel);
    };
  }, [userId, queryClient, supabase]);
}

/**
 * Combined hook for all calendar real-time subscriptions
 */
export function useRealtimeCalendarIntegration(userId?: string, eventId?: string) {
  useRealtimeCalendar(userId);
  useRealtimeEventParticipants(eventId);
  useRealtimeCalendarTodos(userId);
  useRealtimeWorkload(userId);
}

/**
 * Subscribe to broadcast channel for manual events
 * (e.g., auto-completion notifications)
 */
export function useCalendarBroadcast(onAutoComplete?: (data: any) => void) {
  const supabase = createClientSupabaseClient();

  useEffect(() => {
    const broadcastChannel = supabase
      .channel('calendar-updates')
      .on('broadcast', { event: 'todos-auto-completed' }, (payload) => {
        console.log('Todos auto-completed:', payload);
        if (onAutoComplete) {
          onAutoComplete(payload);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(broadcastChannel);
    };
  }, [supabase, onAutoComplete]);
}
