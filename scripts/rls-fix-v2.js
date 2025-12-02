#!/usr/bin/env node

/**
 * 🚨 RLS FIX v2 - Using REST API approach
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixRLSv2() {
  console.log('🚨 RLS FIX v2 STARTING...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: 'public' }
  });
  
  try {
    // Test connection first
    console.log('🔌 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('workload')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Connection test failed:', testError.message);
      console.log('');
      console.log('💡 Alternative solution:');
      console.log('1. Open Supabase Dashboard: https://supabase.com/dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Copy and paste this SQL:');
      console.log('');
      console.log('-- DROP problematic policies');
      console.log('DROP POLICY IF EXISTS "Users can read own profile" ON users;');
      console.log('DROP POLICY IF EXISTS "Admins can manage all users" ON users;');
      console.log('');
      console.log('-- CREATE simple policies');
      console.log('CREATE POLICY "Allow read access for authentication" ON users FOR SELECT USING (true);');
      console.log('');
      console.log('-- DISABLE RLS on problematic tables');
      console.log('ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;');
      console.log('ALTER TABLE e_kinerja DISABLE ROW LEVEL SECURITY;');
      console.log('ALTER TABLE settings DISABLE ROW LEVEL SECURITY;');
      
      return;
    }
    
    console.log('✅ Connection successful! Available to run manual SQL fix.');
    console.log('');
    console.log('🔧 MANUAL STEPS (5 minutes):');
    console.log('1. Go to: https://jofdbruqjjzixyrsfviu.supabase.co/project/jofdbruqjjzixyrsfviu/sql/new');
    console.log('2. Copy content from file: database/fix-rls-policies.sql');
    console.log('3. Paste and RUN in SQL Editor');
    console.log('4. Refresh workload page');
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
  }
}

fixRLSv2();