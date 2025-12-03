/**
 * Real-time Calendar Subscriptions
 * Disabled - react-query dependency removed for production deployment
 */

/**
 * Subscribe to calendar_events table changes - DISABLED
 */
export function useRealtimeCalendar(userId?: string) {
  // Disabled for production deployment - no react-query dependency
  return;
}

/**
 * Subscribe to single calendar event changes - DISABLED
 */
export function useRealtimeCalendarEvent(eventId?: string) {
  // Disabled for production deployment - no react-query dependency
  return;
}

/**
 * Subscribe to calendar_todos table changes - DISABLED
 */
export function useRealtimeCalendarTodos(userId?: string) {
  // Disabled for production deployment - no react-query dependency
  return;
}

/**
 * Subscribe to workload table changes that affect calendar - DISABLED
 */
export function useRealtimeWorkloadCalendar(userId?: string) {
  // Disabled for production deployment - no react-query dependency
  return;
}

/**
 * Master hook for all calendar real-time subscriptions - DISABLED
 */
export function useRealtimeCalendarMaster(userId?: string, eventId?: string) {
  // Disabled for production deployment - no react-query dependency
  return;
}