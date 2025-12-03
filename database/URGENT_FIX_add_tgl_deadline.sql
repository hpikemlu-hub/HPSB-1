-- ========================================
-- URGENT FIX: Add missing tgl_deadline column
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Add the missing deadline column
ALTER TABLE workload ADD COLUMN IF NOT EXISTS tgl_deadline DATE;

-- Step 2: Create index for performance
CREATE INDEX IF NOT EXISTS idx_workload_deadline ON workload(tgl_deadline);

-- Step 3: Add comment for documentation
COMMENT ON COLUMN workload.tgl_deadline IS 'Target deadline date for workload completion';

-- Step 4: Update the workload_summary view
DROP VIEW IF EXISTS workload_summary;
CREATE VIEW workload_summary AS
SELECT 
    w.id,
    w.nama,
    w.type,
    w.status,
    w.fungsi,
    w.tgl_diterima,
    w.tgl_deadline,  -- Now includes deadline
    u.nama_lengkap as user_name,
    w.created_at
FROM workload w
LEFT JOIN users u ON w.user_id = u.id;

-- Step 5: Grant permissions
GRANT SELECT ON workload_summary TO anon, authenticated;

-- Step 6: Verify the fix
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'workload' 
AND column_name = 'tgl_deadline';