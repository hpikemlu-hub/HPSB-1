-- ========================================
-- IMPROVED ROW LEVEL SECURITY POLICIES
-- For Employee Module Backend Integration
-- ========================================

-- Drop existing policies for clean slate
DROP POLICY IF EXISTS "Allow read access for authentication" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Allow anon insert for demo" ON users;

-- ========================================
-- USERS TABLE POLICIES
-- ========================================

-- 1. Authentication access - allow reading for login verification
CREATE POLICY "Authentication read access" ON users
    FOR SELECT USING (
        -- Allow reading for authentication purposes
        auth.role() = 'anon' OR 
        auth.role() = 'authenticated' OR
        auth.role() = 'service_role'
    );

-- 2. Admin full access - admins can manage all users
CREATE POLICY "Admin full access" ON users
    FOR ALL USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND 
         EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
            AND u.is_active = true
         ))
    );

-- 3. User self-management - users can update their own profile
CREATE POLICY "User self update" ON users
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        id::text = auth.uid()::text
    )
    WITH CHECK (
        auth.role() = 'authenticated' AND 
        id::text = auth.uid()::text AND
        -- Prevent role escalation
        role = (SELECT role FROM users WHERE id::text = auth.uid()::text)
    );

-- 4. Admin user creation
CREATE POLICY "Admin user creation" ON users
    FOR INSERT WITH CHECK (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND 
         EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
            AND u.is_active = true
         ))
    );

-- ========================================
-- WORKLOAD TABLE POLICIES
-- ========================================

-- Drop existing workload policies
DROP POLICY IF EXISTS "Allow read all workload" ON workload;
DROP POLICY IF EXISTS "Allow insert workload" ON workload;
DROP POLICY IF EXISTS "Allow update own workload" ON workload;

-- 1. Workload read access - authenticated users can read all workload
CREATE POLICY "Authenticated workload read" ON workload
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- 2. Workload management - admins can manage all, users can manage own
CREATE POLICY "Workload management" ON workload
    FOR ALL USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND 
         (
            -- Admin can manage all workload
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id::text = auth.uid()::text 
                AND u.role = 'admin'
                AND u.is_active = true
            ) OR
            -- User can manage own workload
            user_id::text = auth.uid()::text
         ))
    );

-- ========================================
-- CALENDAR EVENTS POLICIES
-- ========================================

-- Drop existing calendar policies
DROP POLICY IF EXISTS "Allow read all calendar events" ON calendar_events;
DROP POLICY IF EXISTS "Allow insert calendar events" ON calendar_events;

-- 1. Calendar read access
CREATE POLICY "Authenticated calendar read" ON calendar_events
    FOR SELECT USING (
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role'
    );

-- 2. Calendar management
CREATE POLICY "Calendar management" ON calendar_events
    FOR ALL USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND 
         (
            -- Admin can manage all calendar events
            EXISTS (
                SELECT 1 FROM users u 
                WHERE u.id::text = auth.uid()::text 
                AND u.role = 'admin'
                AND u.is_active = true
            ) OR
            -- User can manage own created events
            creator_id::text = auth.uid()::text
         ))
    );

-- ========================================
-- AUDIT LOG - Keep disabled for performance
-- ========================================
-- Audit log should remain without RLS for better performance
-- and to avoid recursion issues during logging

-- ========================================
-- E_KINERJA - Admin only access
-- ========================================
CREATE POLICY "Admin e_kinerja access" ON e_kinerja
    FOR ALL USING (
        auth.role() = 'service_role' OR
        (auth.role() = 'authenticated' AND 
         EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id::text = auth.uid()::text 
            AND u.role = 'admin'
            AND u.is_active = true
         ))
    );

-- Re-enable RLS on e_kinerja
ALTER TABLE e_kinerja ENABLE ROW LEVEL SECURITY;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Test admin detection function
CREATE OR REPLACE FUNCTION test_admin_access()
RETURNS TABLE (
    current_user_id text,
    is_admin boolean,
    is_active boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        auth.uid()::text as current_user_id,
        COALESCE((SELECT u.role = 'admin' FROM users u WHERE u.id::text = auth.uid()::text), false) as is_admin,
        COALESCE((SELECT u.is_active FROM users u WHERE u.id::text = auth.uid()::text), false) as is_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON POLICY "Authentication read access" ON users IS 'Allows reading user data for authentication and API access';
COMMENT ON POLICY "Admin full access" ON users IS 'Admins have full CRUD access to all user records';
COMMENT ON POLICY "User self update" ON users IS 'Users can update their own profile with role protection';
COMMENT ON POLICY "Admin user creation" ON users IS 'Only admins can create new user accounts';

COMMENT ON FUNCTION test_admin_access() IS 'Helper function to test admin access detection';

-- Display current policy status
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'workload', 'calendar_events', 'e_kinerja')
ORDER BY tablename, policyname;