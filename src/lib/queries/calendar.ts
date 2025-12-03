/**
 * React Query Hooks for Calendar Module
 * Manages server state with caching and real-time updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchCalendarEvents, 
  fetchUserCalendarEvents,
  fetchCalendarEventById,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  fetchOngoingEvents,
  fetchUpcomingEvents
} from '@/lib/api/calendar';
import type { CalendarEvent, CalendarEventForm } from '@/types';

// ========================================
// QUERY KEYS
// ========================================
export const calendarKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarKeys.all, 'events'] as const,
  event: (id: string) => [...calendarKeys.events(), id] as const,
  userEvents: (userId: string) => [...calendarKeys.events(), 'user', userId] as const,
  ongoingEvents: (userId?: string) => [...calendarKeys.events(), 'ongoing', userId] as const,
  upcomingEvents: (userId?: string, limit?: number) => [...calendarKeys.events(), 'upcoming', userId, limit] as const,
  businessTrips: () => [...calendarKeys.events(), 'business-trips'] as const,
};

// ========================================
// QUERY HOOKS
// ========================================

/**
 * Fetch all calendar events
 */
export function useCalendarEvents() {
  return useQuery({
    queryKey: calendarKeys.events(),
    queryFn: () => fetchCalendarEvents(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Fetch calendar events for a specific user
 */
export function useUserCalendarEvents(userId: string) {
  return useQuery({
    queryKey: calendarKeys.userEvents(userId),
    queryFn: () => fetchUserCalendarEvents(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 3, // 3 minutes
  });
}

/**
 * Fetch a single calendar event by ID
 */
export function useCalendarEvent(id: string) {
  return useQuery({
    queryKey: calendarKeys.event(id),
    queryFn: () => fetchCalendarEventById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch ongoing calendar events (trips in progress)
 */
export function useOngoingEvents(userId?: string) {
  return useQuery({
    queryKey: calendarKeys.ongoingEvents(userId),
    queryFn: () => fetchOngoingEvents(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes - more frequent updates for ongoing events
    refetchInterval: 1000 * 60 * 5, // Auto-refetch every 5 minutes
  });
}

/**
 * Fetch upcoming calendar events
 */
export function useUpcomingEvents(userId?: string, limit: number = 5) {
  return useQuery({
    queryKey: calendarKeys.upcomingEvents(userId, limit),
    queryFn: () => fetchUpcomingEvents(userId, limit),
    staleTime: 1000 * 60 * 3,
  });
}

// ========================================
// MUTATION HOOKS
// ========================================

/**
 * Create a new calendar event
 */
export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ eventData, creatorId }: { eventData: CalendarEventForm; creatorId: string }) =>
      createCalendarEvent(eventData, creatorId),
    onSuccess: (newEvent) => {
      // Invalidate all calendar queries to refresh data
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      
      // If it's a user's event, invalidate their specific queries
      if (newEvent.creator_id) {
        queryClient.invalidateQueries({ 
          queryKey: calendarKeys.userEvents(newEvent.creator_id) 
        });
      }
      
      // Invalidate ongoing/upcoming if it's a business trip
      if (newEvent.is_business_trip) {
        queryClient.invalidateQueries({ queryKey: calendarKeys.businessTrips() });
      }
    },
    onError: (error) => {
      console.error('Error creating calendar event:', error);
    },
  });
}

/**
 * Update an existing calendar event
 */
export function useUpdateCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, eventData }: { id: string; eventData: Partial<CalendarEventForm> }) =>
      updateCalendarEvent(id, eventData),
    onSuccess: (updatedEvent) => {
      // Invalidate specific event
      queryClient.invalidateQueries({ queryKey: calendarKeys.event(updatedEvent.id) });
      
      // Invalidate all events list
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
      
      // Invalidate user events
      if (updatedEvent.creator_id) {
        queryClient.invalidateQueries({ 
          queryKey: calendarKeys.userEvents(updatedEvent.creator_id) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating calendar event:', error);
    },
  });
}

/**
 * Delete a calendar event
 */
export function useDeleteCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCalendarEvent,
    onSuccess: () => {
      // Invalidate all calendar queries
      queryClient.invalidateQueries({ queryKey: calendarKeys.events() });
    },
    onError: (error) => {
      console.error('Error deleting calendar event:', error);
    },
  });
}

// ========================================
// OPTIMISTIC UPDATE HELPERS
// ========================================

/**
 * Optimistically update an event in the cache
 */
export function useOptimisticEventUpdate() {
  const queryClient = useQueryClient();
  
  return {
    updateEvent: (eventId: string, updates: Partial<CalendarEvent>) => {
      queryClient.setQueryData(
        calendarKeys.event(eventId),
        (old: CalendarEvent | undefined) => {
          if (!old) return old;
          return { ...old, ...updates };
        }
      );
    },
    
    rollbackEvent: (eventId: string) => {
      queryClient.invalidateQueries({ queryKey: calendarKeys.event(eventId) });
    },
  };
}
