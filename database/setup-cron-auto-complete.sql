-- ========================================
-- SETUP CRON JOB FOR AUTO-COMPLETION
-- PostgreSQL pg_cron Extension
-- ========================================

-- NOTE: This requires the pg_cron extension to be installed
-- For Supabase, this is available in the SQL Editor

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA cron TO postgres;

-- ========================================
-- SCHEDULE AUTO-COMPLETION CRON JOB
-- ========================================

-- Remove existing job if it exists
SELECT cron.unschedule('auto-complete-business-trips');

-- Schedule daily auto-completion at 02:00 WIB
-- WIB = UTC+7, so 02:00 WIB = 19:00 UTC (previous day)
-- Cron format: minute hour day month weekday
SELECT cron.schedule(
    'auto-complete-business-trips',           -- Job name
    '0 19 * * *',                             -- Schedule: 19:00 UTC daily (02:00 WIB next day)
    $$
    -- Call the auto-completion function
    SELECT * FROM auto_complete_business_trips();
    $$
);

-- Alternative: Call Edge Function via HTTP (if using Supabase Edge Functions)
-- Uncomment and replace [YOUR-PROJECT-REF] with your actual Supabase project reference
/*
SELECT cron.schedule(
    'auto-complete-business-trips-edge',
    '0 19 * * *',
    $$
    SELECT net.http_post(
        url := 'https://[YOUR-PROJECT-REF].supabase.co/functions/v1/auto-complete-trips',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
        ),
        body := '{}'::jsonb
    );
    $$
);
*/

-- ========================================
-- VIEW SCHEDULED JOBS
-- ========================================

SELECT 
    jobid,
    jobname,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active
FROM cron.job
WHERE jobname LIKE '%auto-complete%';

-- ========================================
-- VIEW JOB RUN HISTORY
-- ========================================

SELECT 
    runid,
    jobid,
    job_pid,
    database,
    username,
    command,
    status,
    return_message,
    start_time,
    end_time
FROM cron.job_run_details
WHERE jobid IN (
    SELECT jobid FROM cron.job WHERE jobname LIKE '%auto-complete%'
)
ORDER BY start_time DESC
LIMIT 20;

-- ========================================
-- MANUAL TEST
-- ========================================

-- Test the auto-completion function manually
\echo 'Testing auto-completion function...';
\echo '';

SELECT * FROM auto_complete_business_trips();

\echo '';
\echo '========================================';
\echo 'CRON JOB SETUP COMPLETE';
\echo '========================================';
\echo '';
\echo 'The auto-completion job will run daily at 02:00 WIB (19:00 UTC).';
\echo '';
\echo 'To monitor job execution:';
\echo '  SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;';
\echo '';
\echo 'To unschedule the job:';
\echo '  SELECT cron.unschedule(''auto-complete-business-trips'');';
\echo '';
\echo 'To manually trigger:';
\echo '  SELECT * FROM auto_complete_business_trips();';
\echo '';
