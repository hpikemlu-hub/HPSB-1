-- Add auth_uid column to users table and backfill values from Supabase Auth (manual step)
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_uid UUID;
CREATE INDEX IF NOT EXISTS idx_users_auth_uid ON users(auth_uid);

-- Optional: constrain uniqueness if every app user must have auth account
-- ALTER TABLE users ADD CONSTRAINT users_auth_uid_unique UNIQUE (auth_uid);

-- NOTE: Backfill requires fetching UID by email from Supabase Auth (admin API). This cannot be done purely in SQL.
-- Provide a Node script to backfill.
