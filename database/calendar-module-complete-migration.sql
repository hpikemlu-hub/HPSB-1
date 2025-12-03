-- ========================================
-- CALENDAR MODULE - COMPLETE BACKEND MIGRATION
-- HPI Sosbud Kemlu Workload Management System
-- Version: 1.0 - Production Ready
-- ========================================

-- ========================================
-- PART 1: TYPE DEFINITIONS
-- ========================================

-- Create event type enum (if not exists)
DO $$ BEGIN
    CREATE TYPE event_type AS ENUM (
        'perjalanan_dinas',
        'meeting',
        'workshop',
        'conference',
        'training',
        'seminar',
        'rapat_internal',
        'kunjungan',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================
-- PART 2: TABLE ENHANCEMENTS
-- ========================================

-- Add new columns to calendar_events (if not exists)
DO $$ 
BEGIN
    -- Add event_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'event_type'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN event_type event_type DEFAULT 'other';
    END IF;

    -- Add is_business_trip column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'is_business_trip'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN is_business_trip BOOLEAN DEFAULT false;
    END IF;

    -- Add is_all_day column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'is_all_day'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN is_all_day BOOLEAN DEFAULT false;
    END IF;

    -- Add recurrence_rule column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'recurrence_rule'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN recurrence_rule TEXT;
    END IF;

    -- Add parent_event_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'parent_event_id'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN parent_event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE;
    END IF;

    -- Add notes column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'notes'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN notes TEXT;
    END IF;

    -- Add attachment_urls column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'attachment_urls'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN attachment_urls TEXT[];
    END IF;

    -- Add budget_amount column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'budget_amount'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN budget_amount DECIMAL(15,2);
    END IF;

    -- Add budget_source column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'calendar_events' AND column_name = 'budget_source'
    ) THEN
        ALTER TABLE calendar_events ADD COLUMN budget_source TEXT;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN calendar_events.event_type IS 'Type of event: perjalanan_dinas, meeting, workshop, etc.';
COMMENT ON COLUMN calendar_events.is_business_trip IS 'Flag indicating if this is a business trip (perjalanan dinas)';
COMMENT ON COLUMN calendar_events.recurrence_rule IS 'Recurrence rule in RRULE format for recurring events';
COMMENT ON COLUMN calendar_events.parent_event_id IS 'Reference to parent event for recurring instances';

-- ========================================
-- PART 3: JUNCTION TABLES
-- ========================================

-- Create event_participants table (many-to-many: events <-> users)
CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant' CHECK (role IN ('organizer', 'participant', 'observer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- Create calendar_todos table (links events to workload/todos)
CREATE TABLE IF NOT EXISTS calendar_todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES calendar_events(id) ON DELETE CASCADE,
    todo_id UUID NOT NULL REFERENCES workload(id) ON DELETE CASCADE,
    auto_completed BOOLEAN DEFAULT false,
    auto_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, todo_id)
);

-- Create auto_complete_log table (audit trail)
CREATE TABLE IF NOT EXISTS auto_complete_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
    event_title TEXT NOT NULL,
    todo_ids UUID[] NOT NULL,
    todos_completed INTEGER NOT NULL DEFAULT 0,
    execution_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT CHECK (status IN ('success', 'partial', 'failed')),
    error_message TEXT,
    details JSONB
);

-- Add table comments
COMMENT ON TABLE event_participants IS 'Junction table for many-to-many relationship between events and users';
COMMENT ON TABLE calendar_todos IS 'Links calendar events with workload/todos for auto-completion';
COMMENT ON TABLE auto_complete_log IS 'Audit log for automatic todo completion from business trips';

-- ========================================
-- PART 4: INDEXES FOR PERFORMANCE
-- ========================================

-- Event participants indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(status);

-- Calendar todos indexes
CREATE INDEX IF NOT EXISTS idx_calendar_todos_event ON calendar_todos(event_id);
CREATE INDEX IF NOT EXISTS idx_calendar_todos_todo ON calendar_todos(todo_id);
CREATE INDEX IF NOT EXISTS idx_calendar_todos_auto_completed ON calendar_todos(auto_completed);

-- Auto complete log indexes
CREATE INDEX IF NOT EXISTS idx_auto_complete_log_execution ON auto_complete_log(execution_time);
CREATE INDEX IF NOT EXISTS idx_auto_complete_log_event ON auto_complete_log(event_id);
CREATE INDEX IF NOT EXISTS idx_auto_complete_log_status ON auto_complete_log(status);

-- Calendar events additional indexes
CREATE INDEX IF NOT EXISTS idx_calendar_event_type ON calendar_events(event_type);
CREATE INDEX IF NOT EXISTS idx_calendar_is_business_trip ON calendar_events(is_business_trip);
CREATE INDEX IF NOT EXISTS idx_calendar_end_date_business_trip ON calendar_events(end_date, is_business_trip) 
    WHERE is_business_trip = true;
CREATE INDEX IF NOT EXISTS idx_calendar_parent_event ON calendar_events(parent_event_id) 
    WHERE parent_event_id IS NOT NULL;

-- ========================================
-- PART 5: ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on new tables
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_complete_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view event participants" ON event_participants;
DROP POLICY IF EXISTS "Event creators and admins can manage participants" ON event_participants;
DROP POLICY IF EXISTS "Users can view calendar todos" ON calendar_todos;
DROP POLICY IF EXISTS "Authorized users can manage calendar todos" ON calendar_todos;
DROP POLICY IF EXISTS "Admins can view auto complete log" ON auto_complete_log;
DROP POLICY IF EXISTS "Service role full access event_participants" ON event_participants;
DROP POLICY IF EXISTS "Service role full access calendar_todos" ON calendar_todos;
DROP POLICY IF EXISTS "Service role full access auto_complete_log" ON auto_complete_log;

-- ========================================
-- EVENT PARTICIPANTS POLICIES
-- ========================================

-- View policy: Users can see participants of events they're involved with
CREATE POLICY "Users can view event participants" ON event_participants
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND (
            -- Can view if they are the participant
            user_id::text = auth.uid()::text OR
            -- Can view if they created the event
            EXISTS (
                SELECT 1 FROM calendar_events ce 
                WHERE ce.id = event_id 
                AND ce.creator_id::text = auth.uid()::text
            ) OR
            -- Can view if they are also a participant of the event
            EXISTS (
                SELECT 1 FROM event_participants ep2
                WHERE ep2.event_id = event_id
                AND ep2.user_id::text = auth.uid()::text
            ) OR
            -- Admins can view all
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id::text = auth.uid()::text 
                AND u.role = 'admin' 
                AND u.is_active = true
            )
        ))
    );

-- Management policy: Event creators and admins can manage participants
CREATE POLICY "Event creators and admins can manage participants" ON event_participants
    FOR ALL USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND (
            -- Event creator can manage
            EXISTS (
                SELECT 1 FROM calendar_events ce 
                WHERE ce.id = event_id 
                AND ce.creator_id::text = auth.uid()::text
            ) OR
            -- Admins can manage
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id::text = auth.uid()::text 
                AND u.role = 'admin' 
                AND u.is_active = true
            )
        ))
    );

-- Service role full access
CREATE POLICY "Service role full access event_participants" ON event_participants
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- CALENDAR TODOS POLICIES
-- ========================================

-- View policy: Users can see todos linked to their events or their own todos
CREATE POLICY "Users can view calendar todos" ON calendar_todos
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND (
            -- Can view if they own the todo
            EXISTS (
                SELECT 1 FROM workload w 
                WHERE w.id = todo_id 
                AND w.user_id::text = auth.uid()::text
            ) OR
            -- Can view if they created the event
            EXISTS (
                SELECT 1 FROM calendar_events ce 
                WHERE ce.id = event_id 
                AND ce.creator_id::text = auth.uid()::text
            ) OR
            -- Can view if they are a participant of the event
            EXISTS (
                SELECT 1 FROM event_participants ep
                WHERE ep.event_id = event_id
                AND ep.user_id::text = auth.uid()::text
            ) OR
            -- Admins can view all
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id::text = auth.uid()::text 
                AND u.role = 'admin' 
                AND u.is_active = true
            )
        ))
    );

-- Management policy: Todo owners, event creators, and admins can manage
CREATE POLICY "Authorized users can manage calendar todos" ON calendar_todos
    FOR ALL USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND (
            -- Todo owner can link
            EXISTS (
                SELECT 1 FROM workload w 
                WHERE w.id = todo_id 
                AND w.user_id::text = auth.uid()::text
            ) OR
            -- Event creator can link
            EXISTS (
                SELECT 1 FROM calendar_events ce 
                WHERE ce.id = event_id 
                AND ce.creator_id::text = auth.uid()::text
            ) OR
            -- Admins can manage
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id::text = auth.uid()::text 
                AND u.role = 'admin' 
                AND u.is_active = true
            )
        ))
    );

-- Service role full access
CREATE POLICY "Service role full access calendar_todos" ON calendar_todos
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- AUTO COMPLETE LOG POLICIES
-- ========================================

-- Only admins and service role can view logs
CREATE POLICY "Admins can view auto complete log" ON auto_complete_log
    FOR SELECT USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin' 
            AND u.is_active = true
        )
    );

-- Service role full access
CREATE POLICY "Service role full access auto_complete_log" ON auto_complete_log
    FOR ALL USING (auth.role() = 'service_role');

-- ========================================
-- PART 6: TRIGGERS
-- ========================================

-- Update timestamp trigger for event_participants
DROP TRIGGER IF EXISTS update_event_participants_updated_at ON event_participants;
CREATE TRIGGER update_event_participants_updated_at 
    BEFORE UPDATE ON event_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit triggers
DROP TRIGGER IF EXISTS audit_event_participants ON event_participants;
CREATE TRIGGER audit_event_participants 
    AFTER INSERT OR UPDATE OR DELETE ON event_participants
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

DROP TRIGGER IF EXISTS audit_calendar_todos ON calendar_todos;
CREATE TRIGGER audit_calendar_todos 
    AFTER INSERT OR UPDATE OR DELETE ON calendar_todos
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========================================
-- PART 7: DATABASE FUNCTIONS
-- ========================================

-- Function: Get detailed event information
CREATE OR REPLACE FUNCTION get_event_details(p_event_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'event', row_to_json(ce),
        'creator', row_to_json(u),
        'participants', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'participant_id', ep.id,
                    'user_id', ep.user_id,
                    'user_name', u.nama_lengkap,
                    'role', ep.role,
                    'status', ep.status
                )
            )
            FROM event_participants ep
            JOIN users u ON u.id = ep.user_id
            WHERE ep.event_id = p_event_id), '[]'::jsonb
        ),
        'linked_todos', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'todo_id', ct.todo_id,
                    'todo_name', w.nama,
                    'status', w.status,
                    'auto_completed', ct.auto_completed
                )
            )
            FROM calendar_todos ct
            JOIN workload w ON w.id = ct.todo_id
            WHERE ct.event_id = p_event_id), '[]'::jsonb
        )
    ) INTO result
    FROM calendar_events ce
    LEFT JOIN users u ON u.id = ce.creator_id
    WHERE ce.id = p_event_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Auto-complete business trips (Enhanced with timezone handling)
CREATE OR REPLACE FUNCTION auto_complete_business_trips()
RETURNS TABLE(
    event_id UUID,
    event_title TEXT,
    todos_completed INTEGER,
    status TEXT,
    error_message TEXT
) AS $$
DECLARE
    v_event RECORD;
    v_completed_count INTEGER;
    v_todo_ids UUID[];
    v_status TEXT;
    v_error TEXT;
    v_current_date_wib DATE;
BEGIN
    -- Calculate current date in WIB (UTC+7)
    v_current_date_wib := (NOW() AT TIME ZONE 'Asia/Jakarta')::DATE;
    
    -- Find all business trips that have ended (in WIB timezone)
    FOR v_event IN 
        SELECT 
            ce.id,
            ce.title,
            ce.end_date
        FROM calendar_events ce
        WHERE ce.is_business_trip = true
          AND ce.end_date < v_current_date_wib
          AND EXISTS (
              SELECT 1 FROM calendar_todos ct
              JOIN workload w ON w.id = ct.todo_id
              WHERE ct.event_id = ce.id
              AND w.status != 'done'
              AND ct.auto_completed = false
          )
    LOOP
        BEGIN
            v_completed_count := 0;
            v_status := 'success';
            v_error := NULL;
            
            -- Get todo IDs before update
            SELECT array_agg(ct.todo_id) INTO v_todo_ids
            FROM calendar_todos ct
            JOIN workload w ON w.id = ct.todo_id
            WHERE ct.event_id = v_event.id
            AND w.status != 'done'
            AND ct.auto_completed = false;
            
            -- Update linked todos to 'done'
            WITH updated_todos AS (
                UPDATE workload w
                SET status = 'done',
                    updated_at = NOW()
                WHERE w.id IN (
                    SELECT ct.todo_id
                    FROM calendar_todos ct
                    WHERE ct.event_id = v_event.id
                    AND ct.auto_completed = false
                )
                AND w.status != 'done'
                RETURNING w.id
            )
            SELECT COUNT(*) INTO v_completed_count FROM updated_todos;
            
            -- Mark calendar_todos as auto-completed
            UPDATE calendar_todos
            SET auto_completed = true,
                auto_completed_at = NOW()
            WHERE event_id = v_event.id
            AND auto_completed = false;
            
            -- Log success
            INSERT INTO auto_complete_log (
                event_id, 
                event_title, 
                todo_ids, 
                todos_completed, 
                status,
                details
            ) VALUES (
                v_event.id,
                v_event.title,
                v_todo_ids,
                v_completed_count,
                v_status,
                jsonb_build_object(
                    'end_date', v_event.end_date,
                    'completed_at', NOW(),
                    'timezone', 'Asia/Jakarta'
                )
            );
            
        EXCEPTION WHEN OTHERS THEN
            v_status := 'failed';
            v_error := SQLERRM;
            v_completed_count := 0;
            
            -- Log the error
            INSERT INTO auto_complete_log (
                event_id, 
                event_title, 
                todo_ids, 
                todos_completed, 
                status,
                error_message
            ) VALUES (
                v_event.id,
                v_event.title,
                v_todo_ids,
                0,
                v_status,
                v_error
            );
        END;
        
        -- Return result for this event
        event_id := v_event.id;
        event_title := v_event.title;
        todos_completed := v_completed_count;
        status := v_status;
        error_message := v_error;
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user calendar events (with participation)
CREATE OR REPLACE FUNCTION get_user_calendar_events(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL,
    p_event_type event_type DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    event_type event_type,
    is_business_trip BOOLEAN,
    start_date DATE,
    end_date DATE,
    location TEXT,
    color TEXT,
    is_creator BOOLEAN,
    participant_role TEXT,
    participant_status TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        ce.id,
        ce.title,
        ce.description,
        ce.event_type,
        ce.is_business_trip,
        ce.start_date,
        ce.end_date,
        ce.location,
        ce.color,
        ce.creator_id = p_user_id AS is_creator,
        ep.role AS participant_role,
        ep.status AS participant_status
    FROM calendar_events ce
    LEFT JOIN event_participants ep ON ep.event_id = ce.id AND ep.user_id = p_user_id
    WHERE (
        -- User is creator
        ce.creator_id = p_user_id OR
        -- User is participant
        ep.user_id = p_user_id
    )
    AND (p_start_date IS NULL OR ce.end_date >= p_start_date)
    AND (p_end_date IS NULL OR ce.start_date <= p_end_date)
    AND (p_event_type IS NULL OR ce.event_type = p_event_type)
    ORDER BY ce.start_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function comments
COMMENT ON FUNCTION get_event_details(UUID) IS 'Get complete event information including participants and linked todos';
COMMENT ON FUNCTION auto_complete_business_trips() IS 'Automatically completes todos linked to finished business trips (WIB timezone)';
COMMENT ON FUNCTION get_user_calendar_events(UUID, DATE, DATE, event_type) IS 'Get all calendar events for a user (created or participating)';

-- ========================================
-- PART 8: VIEWS FOR REPORTING
-- ========================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS business_trip_summary CASCADE;
DROP VIEW IF EXISTS upcoming_events CASCADE;

-- Business trip summary view
CREATE VIEW business_trip_summary AS
SELECT 
    ce.id,
    ce.title,
    ce.start_date,
    ce.end_date,
    ce.location,
    ce.dipa,
    ce.budget_amount,
    u.nama_lengkap as creator_name,
    COUNT(DISTINCT ep.user_id) as participant_count,
    COUNT(DISTINCT ct.todo_id) as linked_todos_count,
    COUNT(DISTINCT CASE WHEN w.status = 'done' THEN ct.todo_id END) as completed_todos_count
FROM calendar_events ce
LEFT JOIN users u ON u.id = ce.creator_id
LEFT JOIN event_participants ep ON ep.event_id = ce.id
LEFT JOIN calendar_todos ct ON ct.event_id = ce.id
LEFT JOIN workload w ON w.id = ct.todo_id
WHERE ce.is_business_trip = true
GROUP BY ce.id, ce.title, ce.start_date, ce.end_date, ce.location, ce.dipa, ce.budget_amount, u.nama_lengkap;

-- Upcoming events view
CREATE VIEW upcoming_events AS
SELECT 
    ce.id,
    ce.title,
    ce.event_type,
    ce.start_date,
    ce.end_date,
    ce.location,
    ce.is_business_trip,
    u.nama_lengkap as creator_name,
    COUNT(DISTINCT ep.user_id) as participant_count
FROM calendar_events ce
LEFT JOIN users u ON u.id = ce.creator_id
LEFT JOIN event_participants ep ON ep.event_id = ce.id
WHERE ce.start_date >= CURRENT_DATE
GROUP BY ce.id, ce.title, ce.event_type, ce.start_date, ce.end_date, ce.location, ce.is_business_trip, u.nama_lengkap
ORDER BY ce.start_date;

COMMENT ON VIEW business_trip_summary IS 'Summary view of all business trips with participant and todo counts';
COMMENT ON VIEW upcoming_events IS 'View of upcoming calendar events';

-- ========================================
-- PART 9: GRANT PERMISSIONS
-- ========================================

GRANT USAGE ON TYPE event_type TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- ========================================
-- MIGRATION VERIFICATION
-- ========================================

-- Verify all tables exist
DO $$
DECLARE
    missing_tables TEXT[];
BEGIN
    SELECT array_agg(table_name) INTO missing_tables
    FROM (VALUES 
        ('calendar_events'),
        ('event_participants'),
        ('calendar_todos'),
        ('auto_complete_log')
    ) AS required(table_name)
    WHERE NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = required.table_name
    );
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✓ All required tables exist';
    END IF;
END $$;

-- Verify all indexes exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('calendar_events', 'event_participants', 'calendar_todos', 'auto_complete_log')
    ) THEN
        RAISE NOTICE '✓ Performance indexes created';
    END IF;
END $$;

-- Verify RLS is enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('event_participants', 'calendar_todos', 'auto_complete_log')
        AND rowsecurity = false
    ) THEN
        RAISE NOTICE '✓ Row Level Security enabled on all tables';
    END IF;
END $$;

-- ========================================
-- MIGRATION COMPLETE
-- ========================================

SELECT 
    '✓ Calendar Module Migration Complete' as status,
    NOW() as completed_at,
    'All tables, indexes, RLS policies, and functions have been created successfully' as message;
