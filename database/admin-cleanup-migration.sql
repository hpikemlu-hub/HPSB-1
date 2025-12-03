-- ========================================
-- ADMIN ACCOUNT CLEANUP MIGRATION
-- Ensures admin accounts comply with field restrictions
-- ========================================

-- Step 1: Backup current admin data before cleanup
CREATE TABLE IF NOT EXISTS admin_backup_pre_migration AS
SELECT 
    id,
    nama_lengkap,
    nip,
    golongan,
    jabatan,
    username,
    email,
    role,
    is_active,
    created_at,
    updated_at,
    NOW() as backup_created_at
FROM users 
WHERE role = 'admin';

-- Step 2: Display current admin accounts with government fields
SELECT 
    'BEFORE CLEANUP - Admin Accounts with Government Fields' as status,
    COUNT(*) as total_admin_accounts,
    COUNT(*) FILTER (WHERE nip IS NOT NULL) as admins_with_nip,
    COUNT(*) FILTER (WHERE golongan IS NOT NULL) as admins_with_golongan,
    COUNT(*) FILTER (WHERE jabatan IS NOT NULL) as admins_with_jabatan
FROM users 
WHERE role = 'admin';

-- Step 3: Show specific admin accounts that need cleanup
SELECT 
    id,
    nama_lengkap,
    username,
    nip,
    golongan,
    jabatan,
    CASE 
        WHEN nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL 
        THEN 'NEEDS CLEANUP'
        ELSE 'ALREADY CLEAN'
    END as cleanup_status
FROM users 
WHERE role = 'admin'
ORDER BY cleanup_status DESC, nama_lengkap;

-- Step 4: Perform the cleanup
UPDATE users 
SET 
    nip = NULL,
    golongan = NULL,
    jabatan = NULL,
    updated_at = NOW()
WHERE role = 'admin'
  AND (nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL);

-- Step 5: Verify the cleanup was successful
SELECT 
    'AFTER CLEANUP - Admin Account Verification' as status,
    COUNT(*) as total_admin_accounts,
    COUNT(*) FILTER (WHERE nip IS NULL AND golongan IS NULL AND jabatan IS NULL) as clean_admin_accounts,
    COUNT(*) FILTER (WHERE nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL) as dirty_admin_accounts,
    CASE 
        WHEN COUNT(*) FILTER (WHERE nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL) = 0 
        THEN '✅ ALL ADMINS CLEAN' 
        ELSE '❌ SOME ADMINS STILL HAVE GOVERNMENT FIELDS'
    END as cleanup_result
FROM users 
WHERE role = 'admin';

-- Step 6: Show cleaned admin accounts
SELECT 
    id,
    nama_lengkap,
    username,
    email,
    nip,
    golongan,
    jabatan,
    is_active,
    updated_at
FROM users 
WHERE role = 'admin'
ORDER BY nama_lengkap;

-- Step 7: Create audit log entry for the migration
INSERT INTO audit_log (
    user_name,
    action,
    table_name,
    details,
    created_at
)
SELECT 
    'SYSTEM_MIGRATION',
    'ADMIN_CLEANUP',
    'users',
    'Cleaned government fields (NIP, Golongan, Jabatan) from ' || COUNT(*) || ' admin accounts',
    NOW()
FROM admin_backup_pre_migration
WHERE nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL;

-- Step 8: Verify trigger is working correctly
-- Test the admin field restriction trigger
DO $$
DECLARE
    test_admin_id UUID;
BEGIN
    -- Create a test admin with government fields
    INSERT INTO users (nama_lengkap, username, nip, golongan, jabatan, role, email)
    VALUES ('Test Admin Trigger', 'test_admin_trigger', '123456789', 'IV/a', 'Test Jabatan', 'admin', 'test@admin.com')
    RETURNING id INTO test_admin_id;
    
    -- Check if trigger worked
    IF EXISTS (
        SELECT 1 FROM users 
        WHERE id = test_admin_id 
        AND nip IS NULL AND golongan IS NULL AND jabatan IS NULL
    ) THEN
        RAISE NOTICE '✅ Admin field restriction trigger is working correctly';
    ELSE
        RAISE WARNING '❌ Admin field restriction trigger failed - government fields not cleared!';
    END IF;
    
    -- Clean up test data
    DELETE FROM users WHERE id = test_admin_id;
END $$;

-- Step 9: Final verification and summary
SELECT 
    'MIGRATION SUMMARY' as status,
    (SELECT COUNT(*) FROM admin_backup_pre_migration) as total_admins_before,
    (SELECT COUNT(*) FROM admin_backup_pre_migration WHERE nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL) as admins_needed_cleanup,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as total_admins_after,
    (SELECT COUNT(*) FROM users WHERE role = 'admin' AND nip IS NULL AND golongan IS NULL AND jabatan IS NULL) as clean_admins_after,
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE role = 'admin' AND (nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL)) = 0 
        THEN '✅ MIGRATION SUCCESSFUL' 
        ELSE '❌ MIGRATION FAILED'
    END as migration_result;

-- Step 10: Show backup table location
SELECT 
    'BACKUP INFO' as info,
    'admin_backup_pre_migration' as backup_table_name,
    COUNT(*) as backed_up_records,
    MIN(backup_created_at) as backup_timestamp
FROM admin_backup_pre_migration;

-- Step 11: Create index on backup table for easier querying
CREATE INDEX IF NOT EXISTS idx_admin_backup_username ON admin_backup_pre_migration(username);
CREATE INDEX IF NOT EXISTS idx_admin_backup_created ON admin_backup_pre_migration(backup_created_at);

-- Step 12: Add helpful comments
COMMENT ON TABLE admin_backup_pre_migration IS 'Backup of admin accounts before government field cleanup migration';

-- Optional: Drop backup table after verification (uncomment if needed)
-- DROP TABLE IF EXISTS admin_backup_pre_migration;