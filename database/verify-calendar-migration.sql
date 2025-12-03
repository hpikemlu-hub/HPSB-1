-- ========================================
-- CALENDAR MIGRATION VERIFICATION SCRIPT
-- Run this to check if the calendar enhancements migration has been applied
-- ========================================

\echo '========================================';
\echo 'CALENDAR MIGRATION VERIFICATION';
\echo '========================================';
\echo '';

-- Check if tables exist
\echo '1. Checking if new tables exist...';
\echo '';

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_participants')
        THEN '✓ event_participants table exists'
        ELSE '✗ event_participants table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'calendar_todos')
        THEN '✓ calendar_todos table exists'
        ELSE '✗ calendar_todos table MISSING'
    END as status;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'auto_complete_log')
        THEN '✓ auto_complete_log table exists'
        ELSE '✗ auto_complete_log table MISSING'
    END as status;

\echo '';
\echo '2. Checking if new columns exist in calendar_events...';
\echo '';

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'calendar_events' 
AND column_name IN (
    'event_type', 
    'is_business_trip', 
    'is_all_day', 
    'recurrence_rule', 
    'parent_event_id', 
    'notes', 
    'attachment_urls', 
    'budget_amount', 
    'budget_source'
)
ORDER BY column_name;

\echo '';
\echo '3. Checking if event_type enum exists...';
\echo '';

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type')
        THEN '✓ event_type enum exists'
        ELSE '✗ event_type enum MISSING'
    END as status;

-- Show enum values
SELECT 
    enumlabel as event_type_values
FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'event_type'
ORDER BY enumsortorder;

\echo '';
\echo '4. Checking if database functions exist...';
\echo '';

SELECT 
    routine_name as function_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'auto_complete_business_trips',
    'get_user_calendar_events',
    'get_event_details'
)
ORDER BY routine_name;

\echo '';
\echo '5. Checking indexes...';
\echo '';

SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('calendar_events', 'event_participants', 'calendar_todos')
ORDER BY tablename, indexname;

\echo '';
\echo '6. Checking RLS policies...';
\echo '';

SELECT 
    tablename,
    policyname,
    cmd,
    qual IS NOT NULL as has_using_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('event_participants', 'calendar_todos', 'auto_complete_log')
ORDER BY tablename, policyname;

\echo '';
\echo '7. Checking triggers...';
\echo '';

SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('event_participants', 'calendar_todos')
ORDER BY event_object_table, trigger_name;

\echo '';
\echo '8. Sample data check...';
\echo '';

SELECT 
    (SELECT COUNT(*) FROM calendar_events) as total_events,
    (SELECT COUNT(*) FROM calendar_events WHERE is_business_trip = true) as business_trips,
    (SELECT COUNT(*) FROM event_participants) as total_participants,
    (SELECT COUNT(*) FROM calendar_todos) as total_linked_todos,
    (SELECT COUNT(*) FROM auto_complete_log) as auto_complete_logs;

\echo '';
\echo '9. Checking for any migration errors or warnings...';
\echo '';

-- Check for events without event_type
SELECT 
    COUNT(*) as events_without_type,
    'Events without event_type (should be set to default)' as note
FROM calendar_events
WHERE event_type IS NULL;

-- Check for orphaned participants
SELECT 
    COUNT(*) as orphaned_participants,
    'Participants without valid event_id' as note
FROM event_participants ep
WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce WHERE ce.id = ep.event_id);

-- Check for orphaned calendar_todos
SELECT 
    COUNT(*) as orphaned_todo_links,
    'Calendar todos without valid event or todo' as note
FROM calendar_todos ct
WHERE NOT EXISTS (SELECT 1 FROM calendar_events ce WHERE ce.id = ct.event_id)
   OR NOT EXISTS (SELECT 1 FROM workload w WHERE w.id = ct.todo_id);

\echo '';
\echo '========================================';
\echo 'VERIFICATION COMPLETE';
\echo '========================================';
\echo '';
\echo 'If all checks show ✓, migration was successful!';
\echo 'If any checks show ✗, run the migration script:';
\echo '  psql -f database/calendar-enhancements-migration.sql';
\echo '';
