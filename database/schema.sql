-- ========================================
-- WORKLOAD HPI SOSBUD DATABASE SCHEMA
-- Migration from Google Sheets to PostgreSQL
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. USERS TABLE (from PEGAWAI_DB)
-- ========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_lengkap TEXT NOT NULL,
    nip TEXT UNIQUE,
    golongan TEXT,
    jabatan TEXT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE, -- For Supabase Auth
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    is_active BOOLEAN DEFAULT true,
    auth_uid UUID,  -- Maps to Supabase Auth user ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ========================================
-- 2. WORKLOAD TABLE (from DATA sheet)
-- ========================================
CREATE TABLE workload (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    type TEXT NOT NULL,
    deskripsi TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('done', 'on-progress', 'pending')),
    tgl_diterima DATE,
    fungsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_workload_user_id ON workload(user_id);
CREATE INDEX idx_workload_status ON workload(status);
CREATE INDEX idx_workload_type ON workload(type);
CREATE INDEX idx_workload_fungsi ON workload(fungsi);
CREATE INDEX idx_workload_date ON workload(tgl_diterima);

-- ========================================
-- 3. CALENDAR_EVENTS TABLE (from CALENDAR_DATA)
-- ========================================
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    participants TEXT[], -- Array of participant names
    location TEXT,
    dipa TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color TEXT DEFAULT '#0d6efd',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (end_date >= start_date)
);

-- Create indexes
CREATE INDEX idx_calendar_creator ON calendar_events(creator_id);
CREATE INDEX idx_calendar_dates ON calendar_events(start_date, end_date);

-- ========================================
-- 4. AUDIT_LOG TABLE (from HISTORY_LOG)
-- ========================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_audit_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_date ON audit_log(created_at);

-- ========================================
-- 5. E_KINERJA TABLE (from E_KINERJA_DATA)
-- ========================================
CREATE TABLE e_kinerja (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tgl_surat DATE,
    no_surat TEXT,
    perihal TEXT,
    kepada TEXT,
    jenis_surat TEXT,
    tujuan TEXT,
    url_dokumen TEXT,
    file_path TEXT, -- For uploaded files
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_ekinerja_date ON e_kinerja(tgl_surat);
CREATE INDEX idx_ekinerja_jenis ON e_kinerja(jenis_surat);
CREATE INDEX idx_ekinerja_creator ON e_kinerja(created_by);

-- ========================================
-- 6. SETTINGS TABLE (for app configuration)
-- ========================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ROW LEVEL SECURITY POLICIES
-- ========================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workload ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE e_kinerja ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text OR 
                     EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND role = 'admin'));

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND role = 'admin'));

-- Workload policies
CREATE POLICY "Users can read all workload" ON workload
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own workload" ON workload
    FOR ALL USING (user_id::text = auth.uid()::text OR 
                   EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND role = 'admin'));

-- Calendar events policies
CREATE POLICY "Users can read all calendar events" ON calendar_events
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own calendar events" ON calendar_events
    FOR ALL USING (creator_id::text = auth.uid()::text OR 
                   EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND role = 'admin'));

-- Audit log policies (read-only for admins)
CREATE POLICY "Admins can read audit log" ON audit_log
    FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND role = 'admin'));

-- E-Kinerja policies
CREATE POLICY "Users can read all e-kinerja" ON e_kinerja
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage e-kinerja" ON e_kinerja
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE users.id::text = auth.uid()::text AND role = 'admin'));

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workload_updated_at BEFORE UPDATE ON workload
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_e_kinerja_updated_at BEFORE UPDATE ON e_kinerja
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_name, action, table_name, record_id, old_values)
        VALUES (COALESCE(current_setting('app.current_user', true), 'system'), 
                TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_name, action, table_name, record_id, old_values, new_values)
        VALUES (COALESCE(current_setting('app.current_user', true), 'system'), 
                TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_name, action, table_name, record_id, new_values)
        VALUES (COALESCE(current_setting('app.current_user', true), 'system'), 
                TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_workload AFTER INSERT OR UPDATE OR DELETE ON workload
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_calendar_events AFTER INSERT OR UPDATE OR DELETE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_e_kinerja AFTER INSERT OR UPDATE OR DELETE ON e_kinerja
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ========================================
-- SAMPLE DATA INSERTION (for testing)
-- ========================================

-- Insert admin user
INSERT INTO users (nama_lengkap, username, email, role) VALUES
('Administrator', 'admin', 'admin@kemlu.go.id', 'admin');

-- Insert sample settings
INSERT INTO settings (key, value, description) VALUES
('app_name', '"Workload HPI Sosbud"', 'Application name'),
('app_version', '"1.0.0"', 'Application version'),
('max_file_size', '10485760', 'Maximum file upload size in bytes (10MB)'),
('allowed_file_types', '["pdf", "doc", "docx", "jpg", "png"]', 'Allowed file upload types');

-- Create views for reporting
CREATE VIEW workload_summary AS
SELECT 
    w.id,
    w.nama,
    w.type,
    w.status,
    w.fungsi,
    w.tgl_diterima,
    u.nama_lengkap as user_name,
    w.created_at
FROM workload w
LEFT JOIN users u ON w.user_id = u.id;

CREATE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM workload) as total_workload,
    (SELECT COUNT(*) FROM workload WHERE status = 'done') as completed_workload,
    (SELECT COUNT(*) FROM workload WHERE status = 'on-progress') as in_progress_workload,
    (SELECT COUNT(*) FROM workload WHERE status = 'pending') as pending_workload,
    (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;