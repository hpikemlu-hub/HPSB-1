import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client - Using service role to bypass RLS issues
export const createClientSupabaseClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Demo client using service role to bypass RLS (for development only)
export const supabaseDemo = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabase = supabaseDemo;

// Server-side Supabase client (for API routes) - Only use on server
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used on the server');
  }
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Database Tables
export const TABLES = {
  USERS: 'users',
  WORKLOAD: 'workload',
  CALENDAR_EVENTS: 'calendar_events',
  AUDIT_LOG: 'audit_log',
  E_KINERJA: 'e_kinerja'
} as const;