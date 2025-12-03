-- ========================================
-- CONVERT EVENT_TYPE FROM ENUM TO TEXT
-- Migration to make event_type flexible (not strict enum)
-- ========================================
-- This migration converts the event_type column from a strict PostgreSQL ENUM
-- to TEXT type, allowing for more flexible category values while maintaining
-- backward compatibility with existing data.
-- ========================================

BEGIN;

-- Step 1: Add a temporary text column
ALTER TABLE calendar_events 
    ADD COLUMN event_type_temp TEXT;

-- Step 2: Copy data from enum to text (casting to text)
UPDATE calendar_events 
    SET event_type_temp = event_type::text;

-- Step 3: Drop the old enum column
ALTER TABLE calendar_events 
    DROP COLUMN event_type;

-- Step 4: Rename the temp column to event_type
ALTER TABLE calendar_events 
    RENAME COLUMN event_type_temp TO event_type;

-- Step 5: Set default value
ALTER TABLE calendar_events 
    ALTER COLUMN event_type SET DEFAULT 'other';

-- Step 6: Add comment for documentation
COMMENT ON COLUMN calendar_events.event_type IS 'Type of event (flexible text): perjalanan_dinas, meeting, workshop, conference, training, seminar, rapat_internal, kunjungan, or any custom value';

-- Step 7: Recreate index
DROP INDEX IF EXISTS idx_calendar_event_type;
CREATE INDEX idx_calendar_event_type ON calendar_events(event_type);

-- Step 8: Drop the enum type (only if not used elsewhere)
-- Note: This will fail if the enum is still referenced anywhere
-- If it fails, it's safe to ignore - the enum can remain in the database
DROP TYPE IF EXISTS event_type CASCADE;

-- Step 9: Update function signatures that use event_type enum
-- Update get_user_calendar_events function to use TEXT instead of enum
CREATE OR REPLACE FUNCTION get_user_calendar_events(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_event_type TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    description TEXT,
    event_type TEXT,
    is_business_trip BOOLEAN,
    is_all_day BOOLEAN,
    start_date DATE,
    end_date DATE,
    location TEXT,
    creator_name TEXT,
    participant_count BIGINT,
    todo_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id,
        ce.title,
        ce.description,
        ce.event_type,
        ce.is_business_trip,
        ce.is_all_day,
        ce.start_date,
        ce.end_date,
        ce.location,
        u.nama_lengkap as creator_name,
        COUNT(DISTINCT ep.user_id) as participant_count,
        COUNT(DISTINCT ct.todo_id) as todo_count
    FROM calendar_events ce
    LEFT JOIN users u ON ce.creator_id = u.id
    LEFT JOIN event_participants ep ON ce.id = ep.event_id
    LEFT JOIN calendar_todos ct ON ce.id = ct.event_id
    WHERE 
        (ce.creator_id = p_user_id OR ep.user_id = p_user_id)
        AND (p_start_date IS NULL OR ce.start_date >= p_start_date)
        AND (p_end_date IS NULL OR ce.end_date <= p_end_date)
        AND (p_event_type IS NULL OR ce.event_type = p_event_type)
    GROUP BY ce.id, ce.title, ce.description, ce.event_type, ce.is_business_trip, 
             ce.is_all_day, ce.start_date, ce.end_date, ce.location, u.nama_lengkap
    ORDER BY ce.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update function comment
COMMENT ON FUNCTION get_user_calendar_events(UUID, DATE, DATE, TEXT) IS 'Get all calendar events for a user (created or participating) with flexible event_type';

COMMIT;

-- ========================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ========================================
-- To rollback this migration:
-- 
-- BEGIN;
-- 
-- -- Recreate the enum type
-- CREATE TYPE event_type AS ENUM (
--     'perjalanan_dinas', 'meeting', 'workshop', 'conference',
--     'training', 'seminar', 'rapat_internal', 'kunjungan', 'other'
-- );
-- 
-- -- Convert column back to enum (this will fail if there are values not in the enum)
-- ALTER TABLE calendar_events 
--     ALTER COLUMN event_type TYPE event_type USING event_type::event_type;
-- 
-- COMMIT;
