/**
 * Calendar Real-Time Subscription Manager
 * Handles WebSocket subscriptions for calendar events
 */

import { createClientSupabaseClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export class CalendarRealtimeManager {
  private supabase = createClientSupabaseClient();
  private channels: RealtimeChannel[] = [];

  /**
   * Subscribe to calendar event changes for a specific user
   */
  subscribeToEvents(userId: string, callback: (payload: any) => void) {
    const channel = this.supabase
      .channel('calendar-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events',
          filter: `creator_id=eq.${userId}`
        },
        (payload) => {
          console.log('Event change detected:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  /**
   * Subscribe to participant changes for a specific user
   */
  subscribeToParticipants(userId: string, callback: (payload: any) => void) {
    const channel = this.supabase
      .channel('participant-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_participants',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Participant change detected:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  /**
   * Subscribe to todo completion broadcasts
   */
  subscribeToAutoComplete(callback: (payload: any) => void) {
    const channel = this.supabase
      .channel('calendar-updates')
      .on('broadcast', { event: 'todos-auto-completed' }, (payload) => {
        console.log('Auto-complete notification:', payload);
        callback(payload);
      })
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  /**
   * Subscribe to workload/todo changes
   */
  subscribeToTodos(userId: string, callback: (payload: any) => void) {
    const channel = this.supabase
      .channel('todo-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workload',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Todo change detected:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.channels.push(channel);
    return channel;
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.channels.forEach(channel => {
      this.supabase.removeChannel(channel);
    });
    this.channels = [];
  }
}
