/**
 * Real-time calendar updates hook
 * Auto-refreshes when events change
 */

import { useEffect } from 'react';
import { supabase, TABLES } from '@/lib/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseCalendarRealtimeOptions {
  onEventChange?: () => void;
  enabled?: boolean;
}

export function useCalendarRealtime(options: UseCalendarRealtimeOptions = {}) {
  const { onEventChange, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = () => {
      channel = supabase
        .channel('calendar-events-realtime')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TABLES.CALENDAR_EVENTS,
          },
          (payload) => {
            console.log('Calendar event real-time update:', payload);
            
            // Call the onChange callback
            if (onEventChange) {
              onEventChange();
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to calendar events real-time updates');
          }
        });
    };

    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        console.log('Unsubscribed from calendar events real-time updates');
      }
    };
  }, [onEventChange, enabled]);
}
