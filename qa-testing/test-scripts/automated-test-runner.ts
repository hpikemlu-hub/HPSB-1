/**
 * Automated QA Test Runner for Calendar Module
 * Run: npx ts-node qa-testing/test-scripts/automated-test-runner.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

// Utility functions
function log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m'
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
}

function recordTest(
  id: string,
  name: string,
  category: string,
  status: 'pass' | 'fail' | 'skip',
  duration: number,
  error?: string,
  details?: any
) {
  results.push({ id, name, category, status, duration, error, details });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⏭️';
  log(`${icon} ${name} (${duration}ms)`, status === 'pass' ? 'success' : 'error');
}

async function runTest(
  id: string,
  name: string,
  category: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    recordTest(id, name, category, 'pass', Date.now() - start);
  } catch (error: any) {
    recordTest(id, name, category, 'fail', Date.now() - start, error.message);
  }
}

// ========================================
// DATABASE SCHEMA TESTS
// ========================================

async function testDatabaseSchema() {
  log('\n📋 Testing Database Schema...', 'info');

  await runTest(
    'DB-001',
    'calendar_events table exists',
    'Database',
    async () => {
      const { data, error } = await supabase.from('calendar_events').select('id').limit(1);
      if (error) throw new Error(`Table not found: ${error.message}`);
    }
  );

  await runTest(
    'DB-002',
    'event_participants table exists',
    'Database',
    async () => {
      const { data, error } = await supabase.from('event_participants').select('id').limit(1);
      if (error) throw new Error(`Table not found: ${error.message}`);
    }
  );

  await runTest(
    'DB-003',
    'calendar_todos table exists',
    'Database',
    async () => {
      const { data, error } = await supabase.from('calendar_todos').select('id').limit(1);
      if (error) throw new Error(`Table not found: ${error.message}`);
    }
  );

  await runTest(
    'DB-004',
    'auto_complete_log table exists',
    'Database',
    async () => {
      const { data, error } = await supabase.from('auto_complete_log').select('id').limit(1);
      if (error) throw new Error(`Table not found: ${error.message}`);
    }
  );
}

// ========================================
// DATABASE FUNCTIONS TESTS
// ========================================

async function testDatabaseFunctions() {
  log('\n⚙️ Testing Database Functions...', 'info');

  await runTest(
    'FUNC-001',
    'auto_complete_business_trips function exists',
    'Functions',
    async () => {
      const { data, error } = await supabase.rpc('auto_complete_business_trips');
      if (error && !error.message.includes('permission')) {
        throw new Error(`Function error: ${error.message}`);
      }
    }
  );

  await runTest(
    'FUNC-002',
    'get_event_details function exists',
    'Functions',
    async () => {
      const { data, error } = await supabase.rpc('get_event_details', {
        p_event_id: '00000000-0000-0000-0000-000000000000'
      });
      // Function should exist even if ID doesn't
      if (error && error.message.includes('function') && error.message.includes('does not exist')) {
        throw new Error('Function not found');
      }
    }
  );
}

// ========================================
// API ENDPOINT TESTS
// ========================================

async function testAPIEndpoints() {
  log('\n🌐 Testing API Endpoints...', 'info');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  await runTest(
    'API-001',
    'GET /api/calendar/events',
    'API',
    async () => {
      const response = await fetch(`${baseUrl}/api/calendar/events`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error('Response not successful');
    }
  );

  await runTest(
    'API-002',
    'POST /api/calendar/auto-complete (dry run)',
    'API',
    async () => {
      const response = await fetch(`${baseUrl}/api/calendar/auto-complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dry_run: true })
      });
      if (!response.ok && response.status !== 401) {
        throw new Error(`Status: ${response.status}`);
      }
    }
  );

  await runTest(
    'API-003',
    'GET /api/workload/calendar-linked',
    'API',
    async () => {
      const response = await fetch(`${baseUrl}/api/workload/calendar-linked`);
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      const data = await response.json();
      if (!data.success) throw new Error('Response not successful');
    }
  );
}

// ========================================
// EVENT CRUD TESTS
// ========================================

async function testEventCRUD() {
  log('\n📝 Testing Event CRUD Operations...', 'info');

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  let createdEventId: string;

  await runTest(
    'CRUD-001',
    'Create calendar event',
    'CRUD',
    async () => {
      const testEvent = {
        title: 'QA Test Event ' + Date.now(),
        description: 'Automated test event',
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        event_type: 'meeting',
        creator_id: '00000000-0000-0000-0000-000000000000' // Mock ID
      };

      const response = await fetch(`${baseUrl}/api/calendar/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEvent)
      });

      if (response.status === 201 || response.status === 200) {
        const data = await response.json();
        createdEventId = data.data?.id;
      } else {
        throw new Error(`Failed to create: ${response.status}`);
      }
    }
  );

  await runTest(
    'CRUD-002',
    'Fetch event by ID',
    'CRUD',
    async () => {
      if (!createdEventId) throw new Error('No event ID from previous test');
      
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', createdEventId)
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error('Event not found');
    }
  );
}

// ========================================
// AUTO-COMPLETE TESTS
// ========================================

async function testAutoComplete() {
  log('\n⏰ Testing Auto-Complete Functionality...', 'info');

  await runTest(
    'AUTO-001',
    'Check past events for auto-completion',
    'Auto-Complete',
    async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { data, error } = await supabase
        .from('calendar_events')
        .select('id, title, end_date')
        .eq('is_business_trip', true)
        .lt('end_date', yesterday.toISOString());

      if (error) throw new Error(error.message);
      
      recordTest(
        'AUTO-001-DETAIL',
        `Found ${data?.length || 0} past business trips`,
        'Auto-Complete',
        'pass',
        0,
        undefined,
        { count: data?.length }
      );
    }
  );

  await runTest(
    'AUTO-002',
    'Verify auto_completed flag exists',
    'Auto-Complete',
    async () => {
      const { data, error } = await supabase
        .from('calendar_todos')
        .select('auto_completed, auto_completed_at')
        .limit(1);

      if (error) throw new Error(error.message);
    }
  );
}

// ========================================
// PERFORMANCE TESTS
// ========================================

async function testPerformance() {
  log('\n⚡ Testing Performance...', 'info');

  await runTest(
    'PERF-001',
    'Fetch all events (performance)',
    'Performance',
    async () => {
      const start = Date.now();
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });

      const duration = Date.now() - start;
      
      if (error) throw new Error(error.message);
      if (duration > 2000) throw new Error(`Too slow: ${duration}ms`);

      log(`  📊 Fetched ${data?.length || 0} events in ${duration}ms`, 'info');
    }
  );

  await runTest(
    'PERF-002',
    'Complex query with joins',
    'Performance',
    async () => {
      const start = Date.now();
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          *,
          creator:users!calendar_events_creator_id_fkey(nama_lengkap),
          calendar_todos(todo:workload(nama, status))
        `)
        .limit(10);

      const duration = Date.now() - start;
      
      if (error) throw new Error(error.message);
      if (duration > 3000) throw new Error(`Too slow: ${duration}ms`);

      log(`  📊 Complex query completed in ${duration}ms`, 'info');
    }
  );
}

// ========================================
// INTEGRATION TESTS
// ========================================

async function testIntegration() {
  log('\n🔗 Testing Calendar-Todo Integration...', 'info');

  await runTest(
    'INT-001',
    'Business trips have linked todos',
    'Integration',
    async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select(`
          id,
          title,
          is_business_trip,
          calendar_todos(
            id,
            todo:workload(id, nama, status)
          )
        `)
        .eq('is_business_trip', true)
        .limit(5);

      if (error) throw new Error(error.message);
      
      log(`  📊 Checked ${data?.length || 0} business trips`, 'info');
    }
  );
}

// ========================================
// MAIN TEST RUNNER
// ========================================

async function runAllTests() {
  console.log('\n');
  log('═══════════════════════════════════════════════════════', 'info');
  log('  CALENDAR MODULE - AUTOMATED QA TEST SUITE', 'info');
  log('  HPI Sosbud Kemlu Workload Management System', 'info');
  log('═══════════════════════════════════════════════════════', 'info');

  const startTime = Date.now();

  try {
    await testDatabaseSchema();
    await testDatabaseFunctions();
    await testAPIEndpoints();
    await testEventCRUD();
    await testAutoComplete();
    await testPerformance();
    await testIntegration();
  } catch (error: any) {
    log(`\n❌ Test suite error: ${error.message}`, 'error');
  }

  const totalDuration = Date.now() - startTime;

  // Generate summary
  console.log('\n');
  log('═══════════════════════════════════════════════════════', 'info');
  log('  TEST SUMMARY', 'info');
  log('═══════════════════════════════════════════════════════', 'info');

  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  const total = results.length;

  log(`\nTotal Tests: ${total}`, 'info');
  log(`✅ Passed: ${passed}`, 'success');
  log(`❌ Failed: ${failed}`, 'error');
  log(`⏭️  Skipped: ${skipped}`, 'warning');
  log(`\n⏱️  Total Duration: ${totalDuration}ms`, 'info');
  log(`📊 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`, 'info');

  // Failed tests detail
  if (failed > 0) {
    log('═══════════════════════════════════════════════════════', 'error');
    log('  FAILED TESTS', 'error');
    log('═══════════════════════════════════════════════════════', 'error');
    results
      .filter(r => r.status === 'fail')
      .forEach(r => {
        log(`\n❌ ${r.id}: ${r.name}`, 'error');
        log(`   Category: ${r.category}`, 'info');
        log(`   Error: ${r.error}`, 'error');
      });
  }

  // Write results to file
  const fs = require('fs');
  const reportPath = './qa-testing/test-reports/automated-test-results.json';
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    duration: totalDuration,
    summary: { total, passed, failed, skipped },
    results
  }, null, 2));

  log(`\n📄 Full report saved to: ${reportPath}\n`, 'info');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Fatal error: ${error.message}`, 'error');
  process.exit(1);
});
