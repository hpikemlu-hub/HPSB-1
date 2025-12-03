/**
 * Custom hook for calendar events with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase/client';
import { fetchCalendarEvents, fetchUserCalendarEvents } from '@/lib/api/calendar';
import type { CalendarEvent } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseCalendarEventsOptions {
  userId?: string;
  autoRefresh?: boolean;
}

export function useCalendarEvents(options: UseCalendarEventsOptions = {}) {
  const { userId, autoRefresh = true } = options;
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = userId 
        ? await fetchUserCalendarEvents(userId)
        : await fetchCalendarEvents();
      
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendar events');
      console.error('Error loading calendar events:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadEvents();

    if (!autoRefresh) return;

    // Set up real-time subscription
    const channel: RealtimeChannel = supabase
      .channel('calendar-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: TABLES.CALENDAR_EVENTS,
        },
        (payload) => {
          console.log('Calendar event change detected:', payload);
          // Reload events on any change
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadEvents, autoRefresh]);

  return {
    events,
    loading,
    error,
    refresh: loadEvents,
  };
}
