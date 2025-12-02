-- ========================================
-- ENABLE REAL-TIME FOR CALENDAR MODULE
-- Supabase Real-Time Configuration
-- ========================================

-- Enable real-time replication for calendar_events
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_events;

-- Enable real-time replication for event_participants
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;

-- Enable real-time replication for calendar_todos
ALTER PUBLICATION supabase_realtime ADD TABLE calendar_todos;

-- Enable real-time replication for workload (if not already enabled)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'workload'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE workload;
    END IF;
END $$;

-- Verify real-time is enabled
SELECT 
    schemaname,
    tablename,
    'Real-time enabled' as status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('calendar_events', 'event_participants', 'calendar_todos', 'workload')
ORDER BY tablename;

-- ========================================
-- REAL-TIME CONFIGURATION NOTES
-- ========================================

/*
CLIENT-SIDE SUBSCRIPTION EXAMPLES:

1. Subscribe to calendar events:
   const channel = supabase
     .channel('calendar-changes')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'calendar_events'
     }, (payload) => {
       console.log('Calendar changed:', payload);
     })
     .subscribe();

2. Subscribe to specific user's events:
   const channel = supabase
     .channel('user-calendar')
     .on('postgres_changes', {
       event: '*',
       schema: 'public',
       table: 'calendar_events',
       filter: `creator_id=eq.${userId}`
     }, (payload) => {
       console.log('User calendar changed:', payload);
     })
     .subscribe();

3. Subscribe to broadcast messages:
   const channel = supabase
     .channel('calendar-updates')
     .on('broadcast', { event: 'todos-auto-completed' }, (payload) => {
       console.log('Auto-complete notification:', payload);
     })
     .subscribe();

BROADCAST FROM SERVER:
   await supabase.channel('calendar-updates').send({
     type: 'broadcast',
     event: 'todos-auto-completed',
     payload: { results }
   });
*/

-- ========================================
-- MONITORING REAL-TIME STATUS
-- ========================================

-- Check which tables have real-time enabled
SELECT 
    tablename,
    COUNT(*) as publication_count
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
GROUP BY tablename
ORDER BY tablename;

-- ========================================
-- DISABLE REAL-TIME (if needed)
-- ========================================

/*
-- Uncomment to disable real-time for specific tables

ALTER PUBLICATION supabase_realtime DROP TABLE calendar_events;
ALTER PUBLICATION supabase_realtime DROP TABLE event_participants;
ALTER PUBLICATION supabase_realtime DROP TABLE calendar_todos;
*/

SELECT 'Real-time configuration completed successfully' as status;
