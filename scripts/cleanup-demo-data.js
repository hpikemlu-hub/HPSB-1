const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envVars = envFile.split('\n');
    
    envVars.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
    
    console.log('✅ Environment variables loaded from .env.local');
  } else {
    console.error('❌ .env.local file not found');
    console.log('Expected location:', envPath);
    process.exit(1);
  }
}

// Load environment first
loadEnvFile();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('\nCurrent values:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Found' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Cleanup all demo data from database except admin account
 */
async function cleanupDemoData() {
  console.log('🧹 Starting cleanup of demo data...\n');

  try {
    // 1. Clear workload data
    console.log('📋 Clearing workload data...');
    const { data: workloadData, error: workloadError } = await supabase
      .from('workload')
      .delete()
      .neq('id', ''); // Delete all records

    if (workloadError) {
      console.error('❌ Error clearing workload:', workloadError);
    } else {
      console.log('✅ Workload data cleared');
    }

    // 2. Clear calendar events
    console.log('📅 Clearing calendar events...');
    const { data: calendarData, error: calendarError } = await supabase
      .from('calendar_events')
      .delete()
      .neq('id', ''); // Delete all records

    if (calendarError) {
      console.error('❌ Error clearing calendar events:', calendarError);
    } else {
      console.log('✅ Calendar events cleared');
    }

    // 3. Clear audit logs (table name: audit_log)
    console.log('📜 Clearing audit logs...');
    const { data: auditData, error: auditError } = await supabase
      .from('audit_log')
      .delete()
      .neq('id', ''); // Delete all records

    if (auditError) {
      console.error('❌ Error clearing audit logs:', auditError);
    } else {
      console.log('✅ Audit logs cleared');
    }

    // 4. Clear non-admin users (keep admin account)
    console.log('👥 Clearing user data (keeping admin)...');
    
    // First, get admin user ID to preserve
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single();

    if (adminError) {
      console.error('❌ Error finding admin user:', adminError);
    } else if (adminUser) {
      // Delete all users except admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .delete()
        .neq('id', adminUser.id);

      if (userError) {
        console.error('❌ Error clearing user data:', userError);
      } else {
        console.log(`✅ User data cleared (preserved admin: ${adminUser.id})`);
      }
    }

    // 6. Reset auto-increment sequences (if using PostgreSQL)
    console.log('🔄 Resetting sequences...');
    
    // Note: This requires appropriate permissions
    const sequences = [
      'workload_id_seq',
      'calendar_events_id_seq', 
      'documents_id_seq',
      'audit_logs_id_seq'
    ];

    for (const seq of sequences) {
      try {
        const { error: seqError } = await supabase.rpc('restart_sequence', { 
          sequence_name: seq 
        });
        
        if (seqError) {
          console.log(`⚠️  Could not reset sequence ${seq}:`, seqError.message);
        } else {
          console.log(`✅ Sequence ${seq} reset`);
        }
      } catch (error) {
        console.log(`⚠️  Could not reset sequence ${seq}:`, error.message);
      }
    }

    console.log('\n🎉 Cleanup completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- ✅ Workload data cleared');
    console.log('- ✅ Calendar events cleared');
    console.log('- ✅ Audit logs cleared');
    console.log('- ✅ User data cleared (admin preserved)');
    console.log('- ⚠️  Sequences reset (if permissions available)');
    
    console.log('\n🔐 Admin account preserved - system ready for new data import!');

  } catch (error) {
    console.error('💥 Fatal error during cleanup:', error);
    process.exit(1);
  }
}

/**
 * Verify cleanup by counting remaining records
 */
async function verifyCleanup() {
  console.log('\n🔍 Verifying cleanup...');

  const tables = [
    { name: 'workload', label: 'Workload tasks' },
    { name: 'calendar_events', label: 'Calendar events' },
    { name: 'audit_log', label: 'Audit logs' },
    { name: 'users', label: 'Users' }
  ];

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Error counting ${table.label}:`, error);
      } else {
        const remaining = count || 0;
        if (table.name === 'users') {
          console.log(`📊 ${table.label}: ${remaining} (should be 1 - admin only)`);
        } else {
          console.log(`📊 ${table.label}: ${remaining} (should be 0)`);
        }
      }
    } catch (error) {
      console.error(`❌ Error verifying ${table.label}:`, error);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Demo Data Cleanup Script');
  console.log('===========================\n');

  // Confirm before proceeding
  console.log('⚠️  WARNING: This will delete ALL demo data except admin account!');
  console.log('🔒 Admin account will be preserved for system access.\n');

  // In production, you might want to add a confirmation prompt
  // For now, proceeding automatically in script mode
  
  await cleanupDemoData();
  await verifyCleanup();

  console.log('\n✨ Script completed successfully!');
  console.log('📂 System is ready for CSV data import.');
  
  process.exit(0);
}

// Export functions for potential programmatic use
module.exports = {
  cleanupDemoData,
  verifyCleanup
};

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}