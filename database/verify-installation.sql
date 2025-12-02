-- ========================================
-- CALENDAR MODULE - INSTALLATION VERIFICATION
-- Run this script to verify everything is installed correctly
-- ========================================

\echo ''
\echo '========================================='
\echo 'CALENDAR MODULE INSTALLATION VERIFICATION'
\echo '========================================='
\echo ''

-- ========================================
-- 1. CHECK TABLES
-- ========================================
\echo '1. Checking Tables...'
\echo ''

DO $$
DECLARE
    required_tables TEXT[] := ARRAY[
        'calendar_events',
        'event_participants',
        'calendar_todos',
        'auto_complete_log',
        'users',
        'workload'
    ];
    missing_tables TEXT[] := '{}';
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION '❌ Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ All required tables exist';
    END IF;
END $$;

-- ========================================
-- 2. CHECK COLUMNS
-- ========================================
\echo ''
\echo '2. Checking Calendar Events Columns...'
\echo ''

DO $$
DECLARE
    required_columns TEXT[] := ARRAY[
        'event_type',
        'is_business_trip',
        'is_all_day',
        'recurrence_rule',
        'parent_event_id',
        'notes',
        'attachment_urls',
        'budget_amount',
        'budget_source'
    ];
    missing_columns TEXT[] := '{}';
    column_name TEXT;
BEGIN
    FOREACH column_name IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'calendar_events' 
            AND column_name = column_name
        ) THEN
            missing_columns := array_append(missing_columns, column_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION '❌ Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE '✅ All required columns exist on calendar_events';
    END IF;
END $$;

-- ========================================
-- 3. CHECK INDEXES
-- ========================================
\echo ''
\echo '3. Checking Indexes...'
\echo ''

SELECT 
    CASE 
        WHEN COUNT(*) >= 13 THEN '✅ ' || COUNT(*) || ' indexes found (expected >= 13)'
        ELSE '⚠️  Only ' || COUNT(*) || ' indexes found (expected >= 13)'
    END as index_check
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('calendar_events', 'event_participants', 'calendar_todos', 'auto_complete_log');

-- List indexes
\echo ''
\echo 'Index Details:'
SELECT 
    tablename,
    indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('calendar_events', 'event_participants', 'calendar_todos', 'auto_complete_log')
ORDER BY tablename, indexname;

-- ========================================
-- 4. CHECK FUNCTIONS
-- ========================================
\echo ''
\echo '4. Checking Database Functions...'
\echo ''

DO $$
DECLARE
    required_functions TEXT[] := ARRAY[
        'auto_complete_business_trips',
        'get_event_details',
        'get_user_calendar_events'
    ];
    missing_functions TEXT[] := '{}';
    function_name TEXT;
BEGIN
    FOREACH function_name IN ARRAY required_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = function_name
        ) THEN
            missing_functions := array_append(missing_functions, function_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE EXCEPTION '❌ Missing functions: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE '✅ All required functions exist';
    END IF;
END $$;

-- ========================================
-- 5. CHECK RLS
-- ========================================
\echo ''
\echo '5. Checking Row Level Security...'
\echo ''

DO $$
DECLARE
    tables_without_rls TEXT[] := '{}';
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('event_participants', 'calendar_todos', 'auto_complete_log')
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_record.tablename
            AND rowsecurity = true
        ) THEN
            tables_without_rls := array_append(tables_without_rls, table_record.tablename);
        END IF;
    END LOOP;
    
    IF array_length(tables_without_rls, 1) > 0 THEN
        RAISE EXCEPTION '❌ RLS not enabled on: %', array_to_string(tables_without_rls, ', ');
    ELSE
        RAISE NOTICE '✅ RLS enabled on all required tables';
    END IF;
END $$;

-- Check RLS policies
\echo ''
\echo 'RLS Policy Count:'
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('event_participants', 'calendar_todos', 'auto_complete_log')
GROUP BY tablename
ORDER BY tablename;

-- ========================================
-- 6. CHECK VIEWS
-- ========================================
\echo ''
\echo '6. Checking Views...'
\echo ''

DO $$
DECLARE
    required_views TEXT[] := ARRAY[
        'business_trip_summary',
        'upcoming_events'
    ];
    missing_views TEXT[] := '{}';
    view_name TEXT;
BEGIN
    FOREACH view_name IN ARRAY required_views
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_schema = 'public' 
            AND table_name = view_name
        ) THEN
            missing_views := array_append(missing_views, view_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_views, 1) > 0 THEN
        RAISE EXCEPTION '❌ Missing views: %', array_to_string(missing_views, ', ');
    ELSE
        RAISE NOTICE '✅ All required views exist';
    END IF;
END $$;

-- ========================================
-- 7. CHECK TRIGGERS
-- ========================================
\echo ''
\echo '7. Checking Triggers...'
\echo ''

SELECT 
    CASE 
        WHEN COUNT(*) >= 2 THEN '✅ ' || COUNT(*) || ' triggers found'
        ELSE '⚠️  Only ' || COUNT(*) || ' triggers found'
    END as trigger_check
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('event_participants', 'calendar_todos');

-- ========================================
-- 8. TEST FUNCTION EXECUTION
-- ========================================
\echo ''
\echo '8. Testing Function Execution...'
\echo ''

-- Test auto_complete_business_trips (should return empty set if no expired trips)
DO $$
DECLARE
    result_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO result_count
    FROM auto_complete_business_trips();
    
    RAISE NOTICE '✅ auto_complete_business_trips() executed successfully (processed % events)', result_count;
END $$;

-- ========================================
-- 9. CHECK DATA INTEGRITY
-- ========================================
\echo ''
\echo '9. Checking Data Integrity...'
\echo ''

-- Check foreign key constraints
SELECT 
    '✅ Foreign key constraints: ' || COUNT(*) as constraint_check
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_name IN ('calendar_events', 'event_participants', 'calendar_todos', 'auto_complete_log');

-- ========================================
-- 10. SUMMARY
-- ========================================
\echo ''
\echo '========================================='
\echo 'INSTALLATION SUMMARY'
\echo '========================================='
\echo ''

SELECT 
    'Tables' as component,
    COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('calendar_events', 'event_participants', 'calendar_todos', 'auto_complete_log')

UNION ALL

SELECT 
    'Indexes',
    COUNT(*)
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('calendar_events', 'event_participants', 'calendar_todos', 'auto_complete_log')

UNION ALL

SELECT 
    'Functions',
    COUNT(*)
FROM pg_proc 
WHERE proname IN ('auto_complete_business_trips', 'get_event_details', 'get_user_calendar_events')

UNION ALL

SELECT 
    'Views',
    COUNT(*)
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN ('business_trip_summary', 'upcoming_events')

UNION ALL

SELECT 
    'RLS Policies',
    COUNT(*)
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('event_participants', 'calendar_todos', 'auto_complete_log');

-- ========================================
-- FINAL STATUS
-- ========================================
\echo ''
\echo '========================================='
\echo '✅ INSTALLATION VERIFICATION COMPLETE'
\echo '========================================='
\echo ''
\echo 'Next Steps:'
\echo '1. Setup cron job for auto-complete'
\echo '2. Enable real-time: run enable-realtime.sql'
\echo '3. Configure environment variables'
\echo '4. Test API endpoints'
\echo '5. Run health check: GET /api/calendar/health'
\echo ''
\echo 'Documentation:'
\echo '- docs/CALENDAR_BACKEND_ARCHITECTURE.md'
\echo '- docs/CALENDAR_REALTIME_DEPLOYMENT.md'
\echo '- docs/API_EXAMPLES.md'
\echo ''
