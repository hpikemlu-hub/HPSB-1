#!/usr/bin/env node

/**
 * 🔧 AUTOMATED RLS RECURSION FIX SCRIPT
 * 
 * This script will execute the RLS policy fixes automatically
 * using Supabase client with service role key
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function fixRLSPolicies() {
  console.log('🔧 Starting RLS Policy Fix...');
  
  // Check if environment variables exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    console.log('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  // Create Supabase client with service role (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceKey);
  
  try {
    // Read the fix SQL file
    const sqlFilePath = path.join(__dirname, '../database/fix-rls-policies.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 Loaded SQL fix commands from database/fix-rls-policies.sql');
    
    // Split SQL into individual commands
    const commands = sqlCommands
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--'));
    
    console.log(`🔄 Executing ${commands.length} SQL commands...`);
    
    // Execute each command
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command) {
        console.log(`  ${i + 1}. ${command.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: command 
        });
        
        if (error) {
          console.error(`❌ Error executing command ${i + 1}:`, error.message);
        } else {
          console.log(`   ✅ Success`);
        }
      }
    }
    
    console.log('🎉 RLS Policy fix completed!');
    console.log('🔄 Please refresh your workload page to test');
    
  } catch (error) {
    console.error('❌ Script error:', error.message);
    console.log('');
    console.log('🔧 Manual fix required:');
    console.log('1. Open Supabase Dashboard → SQL Editor');
    console.log('2. Copy content from database/fix-rls-policies.sql');
    console.log('3. Execute the SQL commands');
  }
}

// Execute fix
fixRLSPolicies();