-- Employee Module Admin Field Restrictions
-- Ensures admin accounts cannot have NIP, Golongan, Jabatan fields

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS validate_admin_fields_trigger ON users;
DROP FUNCTION IF EXISTS validate_admin_fields();

-- Create function to validate admin fields
CREATE OR REPLACE FUNCTION validate_admin_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If user role is admin, clear government-specific fields
  IF NEW.role = 'admin' THEN
    NEW.nip := NULL;
    NEW.golongan := NULL;
    NEW.jabatan := NULL;
    
    -- Log the field clearing for audit purposes
    RAISE NOTICE 'Admin account detected: cleared government fields for user %', NEW.nama_lengkap;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce this rule on INSERT and UPDATE
CREATE TRIGGER validate_admin_fields_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_admin_fields();

-- Clean existing admin data to ensure consistency
UPDATE users 
SET 
  nip = NULL, 
  golongan = NULL, 
  jabatan = NULL,
  updated_at = NOW()
WHERE role = 'admin';

-- Verify the cleanup
SELECT 
  id,
  nama_lengkap,
  role,
  nip,
  golongan,
  jabatan,
  CASE 
    WHEN role = 'admin' AND (nip IS NOT NULL OR golongan IS NOT NULL OR jabatan IS NOT NULL) 
    THEN 'ERROR: Admin has government fields'
    ELSE 'OK'
  END as validation_status
FROM users 
WHERE role = 'admin';

-- Display summary
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
  COUNT(*) FILTER (WHERE role = 'user') as regular_users,
  COUNT(*) FILTER (WHERE role = 'admin' AND nip IS NULL AND golongan IS NULL AND jabatan IS NULL) as clean_admin_users
FROM users;

COMMENT ON FUNCTION validate_admin_fields() IS 'Ensures admin accounts cannot have government-specific fields (NIP, Golongan, Jabatan)';
COMMENT ON TRIGGER validate_admin_fields_trigger ON users IS 'Enforces admin field restrictions on user table';