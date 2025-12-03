/**
 * Calendar Query Hooks - Simplified for Netlify build
 * Removed React Query dependency for faster deployment
 */

import { 
  fetchCalendarEvents, 
  fetchUserCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  fetchEventDetails,
  createEventParticipant,
  deleteEventParticipant
} from '@/lib/api/calendar';
import type { CalendarEvent, CalendarEventForm } from '@/types';

/**
 * Query key factory for calendar-related queries
 */
export const calendarKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  userEvents: (userId: string) => [...calendarKeys.all, 'user-events', userId] as const,
  event: (eventId: string) => [...calendarKeys.all, 'event', eventId] as const,
  participants: (eventId: string) => [...calendarKeys.all, 'participants', eventId] as const,
  todos: (eventId: string) => [...calendarKeys.all, 'todos', eventId] as const,
  autoComplete: () => [...calendarKeys.all, 'auto-complete'] as const,
} as const;

/**
 * Fetch all calendar events - Simplified version without React Query
 */
export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    return await fetchCalendarEvents();
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
    return [];
  }
}

/**
 * Fetch user-specific calendar events - Simplified version
 */
export async function getUserCalendarEvents(userId: string): Promise<CalendarEvent[]> {
  try {
    return await fetchUserCalendarEvents(userId);
  } catch (error) {
    console.error('Failed to fetch user calendar events:', error);
    return [];
  }
}

/**
 * Create calendar event - Simplified version
 */
export async function createCalendarEventMutation(eventData: CalendarEventForm): Promise<CalendarEvent> {
  try {
    return await createCalendarEvent(eventData);
  } catch (error) {
    console.error('Failed to create calendar event:', error);
    throw error;
  }
}

/**
 * Update calendar event - Simplified version
 */
export async function updateCalendarEventMutation(eventId: string, eventData: Partial<CalendarEventForm>): Promise<CalendarEvent> {
  try {
    return await updateCalendarEvent(eventId, eventData);
  } catch (error) {
    console.error('Failed to update calendar event:', error);
    throw error;
  }
}

/**
 * Delete calendar event - Simplified version
 */
export async function deleteCalendarEventMutation(eventId: string): Promise<void> {
  try {
    await deleteCalendarEvent(eventId);
  } catch (error) {
    console.error('Failed to delete calendar event:', error);
    throw error;
  }
}