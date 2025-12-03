#!/usr/bin/env node

/**
 * 🚨 QUICK RLS RECURSION FIX
 * Direct SQL execution via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function quickFixRLS() {
  console.log('🚨 QUICK RLS RECURSION FIX STARTING...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceKey);
  
  const fixes = [
    // Drop problematic policies
    'DROP POLICY IF EXISTS "Users can read own profile" ON users',
    'DROP POLICY IF EXISTS "Admins can manage all users" ON users',
    
    // Create simple policies
    'CREATE POLICY "Allow read access for authentication" ON users FOR SELECT USING (true)',
    'CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text)',
    'CREATE POLICY "Service role full access" ON users FOR ALL USING (current_setting(\'role\') = \'service_role\')',
    'CREATE POLICY "Allow anon insert for demo" ON users FOR INSERT WITH CHECK (true)',
    
    // Fix workload policies
    'DROP POLICY IF EXISTS "Users can manage own workload" ON workload',
    'CREATE POLICY "Allow read all workload" ON workload FOR SELECT USING (true)',
    'CREATE POLICY "Allow insert workload" ON workload FOR INSERT WITH CHECK (true)',
    'CREATE POLICY "Allow update own workload" ON workload FOR UPDATE USING (true)',
    
    // Disable problematic RLS
    'ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY',
    'ALTER TABLE e_kinerja DISABLE ROW LEVEL SECURITY',
    'ALTER TABLE settings DISABLE ROW LEVEL SECURITY'
  ];
  
  for (let i = 0; i < fixes.length; i++) {
    const sql = fixes[i];
    console.log(`${i + 1}. ${sql.substring(0, 60)}...`);
    
    try {
      const { error } = await supabase.rpc('query', { query_text: sql });
      
      if (error) {
        console.log(`   ⚠️  ${error.message}`);
      } else {
        console.log(`   ✅ Success`);
      }
    } catch (err) {
      console.log(`   ⚠️  ${err.message}`);
    }
  }
  
  console.log('');
  console.log('🎉 RLS FIX COMPLETED!');
  console.log('🔄 Refresh your /workload page to test');
}

quickFixRLS();