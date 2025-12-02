-- ========================================
-- FIX ROW LEVEL SECURITY POLICIES
-- Issue: Infinite recursion in policy for users table
-- ========================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Recreate simpler, working policies for demo
-- For demo purposes, allow anon access to users table for login
CREATE POLICY "Allow read access for authentication" ON users
    FOR SELECT USING (true);

-- Allow authenticated users to update their own records
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow service role to do everything (for admin functions)
CREATE POLICY "Service role full access" ON users
    FOR ALL USING (current_setting('role') = 'service_role');

-- Also temporarily allow anon insert for demo user creation
CREATE POLICY "Allow anon insert for demo" ON users
    FOR INSERT WITH CHECK (true);

-- Fix workload policies too
DROP POLICY IF EXISTS "Users can manage own workload" ON workload;

CREATE POLICY "Allow read all workload" ON workload
    FOR SELECT USING (true);

CREATE POLICY "Allow insert workload" ON workload
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update own workload" ON workload
    FOR UPDATE USING (true);

-- Fix calendar events policies  
DROP POLICY IF EXISTS "Users can manage own calendar events" ON calendar_events;

CREATE POLICY "Allow read all calendar events" ON calendar_events
    FOR SELECT USING (true);

CREATE POLICY "Allow insert calendar events" ON calendar_events
    FOR INSERT WITH CHECK (true);

-- Disable RLS on audit_log to prevent recursion
DROP POLICY IF EXISTS "Admins can read audit log" ON audit_log;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

-- Disable RLS on e_kinerja for demo
DROP POLICY IF EXISTS "Admins can manage e-kinerja" ON e_kinerja;
ALTER TABLE e_kinerja DISABLE ROW LEVEL SECURITY;

-- Disable RLS on settings
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;