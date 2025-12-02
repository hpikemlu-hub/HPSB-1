-- ========================================
-- CALENDAR MODULE DATABASE VERIFICATION
-- Purpose: Verify database schema and data integrity
-- Usage: psql $DATABASE_URL -f calendar-db-verification.sql
-- ========================================

\echo '╔══════════════════════════════════════════════════════════════╗'
\echo '║     Calendar Module - Database Verification Script          ║'
\echo '╚══════════════════════════════════════════════════════════════╝'
\echo ''

-- ========================================
-- TEST 1: Table Existence
-- ========================================
\echo '▶ Test 1: Checking table existence...'

DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    required_tables TEXT[] := ARRAY['calendar_events', 'event_participants', 'calendar_todos', 'workload', 'users'];
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            missing_tables := array_append(missing_tables, tbl);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) IS NULL THEN
        RAISE NOTICE '✓ All required tables exist';
    ELSE
        RAISE WARNING '✗ Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

\echo ''

-- ========================================
-- TEST 2: event_type Column Verification
-- ========================================
\echo '▶ Test 2: Verifying event_type column...'

SELECT 
    CASE 
        WHEN data_type IN ('text', 'character varying') THEN '✓ event_type column exists (TEXT type)'
        WHEN data_type LIKE 'USER-DEFINED%' THEN '✗ event_type is ENUM (should be TEXT)'
        ELSE '✗ event_type has unexpected type: ' || data_type
    END as status,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'calendar_events'
AND column_name = 'event_type';

\echo ''

-- ========================================
-- TEST 3: Foreign Key Constraints
-- ========================================
\echo '▶ Test 3: Checking foreign key constraints...'

SELECT 
    '✓ Foreign key: ' || conname as status,
    conrelid::regclass AS table_name,
    confrelid::regclass AS references_table
FROM pg_constraint
WHERE contype = 'f'
AND (conrelid::regclass::text = 'calendar_events' 
     OR conrelid::regclass::text = 'event_participants'
     OR conrelid::regclass::text = 'calendar_todos')
ORDER BY conrelid::regclass::text, conname;

\echo ''

-- ========================================
-- TEST 4: Index Verification
-- ========================================
\echo '▶ Test 4: Verifying indexes...'

SELECT 
    '✓ Index: ' || indexname as status,
    tablename,
    indexdef
FROM pg_indexes
WHERE tablename IN ('calendar_events', 'event_participants', 'calendar_todos')
ORDER BY tablename, indexname;

\echo ''

-- ========================================
-- TEST 5: Event Type Distribution
-- ========================================
\echo '▶ Test 5: Analyzing event_type distribution...'

SELECT 
    '📊 Category: ' || COALESCE(event_type, 'NULL') as category,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) || '%' as percentage
FROM calendar_events
GROUP BY event_type
ORDER BY COUNT(*) DESC
LIMIT 10;

\echo ''

-- ========================================
-- TEST 6: Data Integrity Checks
-- ========================================
\echo '▶ Test 6: Running data integrity checks...'

-- Check for orphaned event_participants
WITH orphaned_participants AS (
    SELECT COUNT(*) as count
    FROM event_participants ep
    LEFT JOIN calendar_events ce ON ep.event_id = ce.id
    WHERE ce.id IS NULL
)
SELECT 
    CASE 
        WHEN count = 0 THEN '✓ No orphaned event_participants'
        ELSE '✗ Found ' || count || ' orphaned event_participants'
    END as status
FROM orphaned_participants;

-- Check for orphaned calendar_todos
WITH orphaned_todos AS (
    SELECT COUNT(*) as count
    FROM calendar_todos ct
    LEFT JOIN calendar_events ce ON ct.event_id = ce.id
    WHERE ce.id IS NULL
)
SELECT 
    CASE 
        WHEN count = 0 THEN '✓ No orphaned calendar_todos'
        ELSE '✗ Found ' || count || ' orphaned calendar_todos'
    END as status
FROM orphaned_todos;

-- Check for invalid date ranges
WITH invalid_dates AS (
    SELECT COUNT(*) as count
    FROM calendar_events
    WHERE end_date < start_date
)
SELECT 
    CASE 
        WHEN count = 0 THEN '✓ No invalid date ranges'
        ELSE '✗ Found ' || count || ' events with end_date < start_date'
    END as status
FROM invalid_dates;

\echo ''

-- ========================================
-- TEST 7: Real-Time Subscription Readiness
-- ========================================
\echo '▶ Test 7: Checking real-time subscription configuration...'

-- Check if replication is enabled
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✓ Replication slot exists (Real-time enabled)'
        ELSE '⚠ No replication slot found (Real-time may not work)'
    END as status
FROM pg_replication_slots
WHERE slot_name LIKE '%supabase%' OR slot_name LIKE '%realtime%';

\echo ''

-- ========================================
-- TEST 8: Calendar-Workload Linkage
-- ========================================
\echo '▶ Test 8: Verifying calendar-workload linkage...'

SELECT 
    '📊 ' || COUNT(DISTINCT ct.event_id) || ' events linked to workload' as metric
FROM calendar_todos ct;

SELECT 
    '📊 ' || COUNT(*) || ' total calendar-workload links' as metric
FROM calendar_todos;

SELECT 
    '📊 ' || COUNT(*) || ' auto-completed todos' as metric
FROM calendar_todos
WHERE auto_completed = true;

\echo ''

-- ========================================
-- TEST 9: Recent Activity Check
-- ========================================
\echo '▶ Test 9: Checking recent activity...'

-- Events created in last 24 hours
SELECT 
    '📊 ' || COUNT(*) || ' events created in last 24 hours' as metric
FROM calendar_events
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Events updated in last 24 hours
SELECT 
    '📊 ' || COUNT(*) || ' events updated in last 24 hours' as metric
FROM calendar_events
WHERE updated_at > NOW() - INTERVAL '24 hours';

\echo ''

-- ========================================
-- TEST 10: Sample Data Query
-- ========================================
\echo '▶ Test 10: Displaying sample events...'

SELECT 
    LEFT(title, 40) as title,
    COALESCE(event_type, 'NULL') as category,
    start_date,
    end_date,
    COALESCE(location, '-') as location,
    (SELECT COUNT(*) FROM event_participants WHERE event_id = ce.id) as participants
FROM calendar_events ce
ORDER BY created_at DESC
LIMIT 5;

\echo ''

-- ========================================
-- SUMMARY REPORT
-- ========================================
\echo '╔══════════════════════════════════════════════════════════════╗'
\echo '║                    VERIFICATION SUMMARY                      ║'
\echo '╚══════════════════════════════════════════════════════════════╝'

SELECT 
    '📊 Total Events: ' || COUNT(*) as metric
FROM calendar_events;

SELECT 
    '📊 Unique Categories: ' || COUNT(DISTINCT event_type) as metric
FROM calendar_events
WHERE event_type IS NOT NULL;

SELECT 
    '📊 Events with Participants: ' || COUNT(DISTINCT event_id) as metric
FROM event_participants;

SELECT 
    '📊 Events with Linked Todos: ' || COUNT(DISTINCT event_id) as metric
FROM calendar_todos;

SELECT 
    '📊 Date Range: ' || 
    COALESCE(MIN(start_date)::text, 'N/A') || ' to ' || 
    COALESCE(MAX(end_date)::text, 'N/A') as metric
FROM calendar_events;

\echo ''
\echo '✅ Verification complete! Review any warnings or errors above.'
\echo ''
\echo 'Next steps:'
\echo '  • If event_type is ENUM, run: convert-event-type-enum-to-text.sql'
\echo '  • If orphaned records found, investigate and clean up'
\echo '  • If real-time slot missing, enable in Supabase dashboard'
\echo ''

-- ========================================
-- OPTIONAL: Advanced Diagnostics
-- ========================================
\echo '╔══════════════════════════════════════════════════════════════╗'
\echo '║              ADVANCED DIAGNOSTICS (OPTIONAL)                 ║'
\echo '╚══════════════════════════════════════════════════════════════╝'
\echo ''
\echo 'Uncomment sections below for detailed analysis:'
\echo ''

-- Uncomment to see full schema
-- \d calendar_events

-- Uncomment to see all constraints
-- SELECT * FROM information_schema.table_constraints 
-- WHERE table_name = 'calendar_events';

-- Uncomment to see function definitions
-- \df get_user_calendar_events

-- Uncomment to analyze table statistics
-- ANALYZE calendar_events;
-- SELECT * FROM pg_stats WHERE tablename = 'calendar_events';

-- ========================================
-- END OF VERIFICATION SCRIPT
-- ========================================
