/**
 * Integration Test Script for Calendar-Workload Module
 * 
 * Run with: npx ts-node scripts/test-integration.ts
 */

import { createClient } from '@supabase/supabase-js';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, message: string, data?: any) {
  const result = { name, passed, message, data };
  results.push(result);
  
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}: ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
}

async function testDatabaseSchema() {
  console.log('\n📋 Testing Database Schema...\n');

  // Test 1: Check if event_participants table exists
  const { data: epTable, error: epError } = await supabase
    .from('event_participants')
    .select('id')
    .limit(1);
  
  logTest(
    'event_participants table exists',
    !epError || epError.code !== '42P01',
    epError ? epError.message : 'Table exists'
  );

  // Test 2: Check if calendar_todos table exists
  const { data: ctTable, error: ctError } = await supabase
    .from('calendar_todos')
    .select('id')
    .limit(1);
  
  logTest(
    'calendar_todos table exists',
    !ctError || ctError.code !== '42P01',
    ctError ? ctError.message : 'Table exists'
  );

  // Test 3: Check if auto_complete_log table exists
  const { data: aclTable, error: aclError } = await supabase
    .from('auto_complete_log')
    .select('id')
    .limit(1);
  
  logTest(
    'auto_complete_log table exists',
    !aclError || aclError.code !== '42P01',
    aclError ? aclError.message : 'Table exists'
  );

  // Test 4: Check if new columns exist in calendar_events
  const { data: ceColumns, error: ceError } = await supabase
    .from('calendar_events')
    .select('id, event_type, is_business_trip, is_all_day')
    .limit(1);
  
  logTest(
    'calendar_events has new columns',
    !ceError,
    ceError ? ceError.message : 'New columns exist'
  );
}

async function testDatabaseFunctions() {
  console.log('\n🔧 Testing Database Functions...\n');

  // Get a test user
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .limit(1);

  if (!users || users.length === 0) {
    logTest('Database functions', false, 'No users found for testing');
    return;
  }

  const testUserId = users[0].id;

  // Test 1: get_user_calendar_events function
  const { data: userEvents, error: ueError } = await supabase
    .rpc('get_user_calendar_events', {
      p_user_id: testUserId,
      p_start_date: null,
      p_end_date: null,
      p_event_type: null
    });

  logTest(
    'get_user_calendar_events function',
    !ueError,
    ueError ? ueError.message : `Function works (${userEvents?.length || 0} events)`
  );

  // Test 2: auto_complete_business_trips function (dry run)
  const { data: acResult, error: acError } = await supabase
    .rpc('auto_complete_business_trips');

  logTest(
    'auto_complete_business_trips function',
    !acError,
    acError ? acError.message : `Function works (${acResult?.length || 0} events processed)`,
    acResult
  );
}

async function testEventCreationWithTodos() {
  console.log('\n📅 Testing Event Creation with Auto-Todos...\n');

  // Get test user
  const { data: users } = await supabase
    .from('users')
    .select('id, nama_lengkap')
    .limit(2);

  if (!users || users.length < 2) {
    logTest('Event creation', false, 'Need at least 2 users for testing');
    return;
  }

  const creator = users[0];
  const participant = users[1];

  // Test 1: Create a business trip event
  const { data: newEvent, error: eventError } = await supabase
    .from('calendar_events')
    .insert({
      creator_id: creator.id,
      title: 'Test Business Trip - Integration Test',
      description: 'This is an automated test event',
      event_type: 'perjalanan_dinas',
      is_business_trip: true,
      start_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      end_date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
      location: 'Jakarta',
      color: '#0d6efd'
    })
    .select()
    .single();

  logTest(
    'Create business trip event',
    !eventError && !!newEvent,
    eventError ? eventError.message : 'Event created successfully',
    newEvent
  );

  if (!newEvent) return;

  // Test 2: Add participants
  const { data: participants, error: participantError } = await supabase
    .from('event_participants')
    .insert([
      {
        event_id: newEvent.id,
        user_id: creator.id,
        role: 'organizer',
        status: 'accepted'
      },
      {
        event_id: newEvent.id,
        user_id: participant.id,
        role: 'participant',
        status: 'pending'
      }
    ])
    .select();

  logTest(
    'Add event participants',
    !participantError && participants?.length === 2,
    participantError ? participantError.message : `${participants?.length || 0} participants added`,
    participants
  );

  // Test 3: Create todos for participants
  const { data: todos, error: todoError } = await supabase
    .from('workload')
    .insert([
      {
        user_id: creator.id,
        nama: `Test Todo - ${newEvent.title} - ${creator.nama_lengkap}`,
        type: 'Perjalanan Dinas',
        deskripsi: 'Auto-generated test todo',
        status: 'on-progress',
        tgl_diterima: new Date().toISOString().split('T')[0],
        fungsi: 'NON FUNGSI'
      },
      {
        user_id: participant.id,
        nama: `Test Todo - ${newEvent.title} - ${participant.nama_lengkap}`,
        type: 'Perjalanan Dinas',
        deskripsi: 'Auto-generated test todo',
        status: 'on-progress',
        tgl_diterima: new Date().toISOString().split('T')[0],
        fungsi: 'NON FUNGSI'
      }
    ])
    .select();

  logTest(
    'Create todos for participants',
    !todoError && todos?.length === 2,
    todoError ? todoError.message : `${todos?.length || 0} todos created`,
    todos
  );

  if (!todos) return;

  // Test 4: Link todos to event
  const { data: links, error: linkError } = await supabase
    .from('calendar_todos')
    .insert(
      todos.map(todo => ({
        event_id: newEvent.id,
        todo_id: todo.id,
        auto_completed: false
      }))
    )
    .select();

  logTest(
    'Link todos to calendar event',
    !linkError && links?.length === 2,
    linkError ? linkError.message : `${links?.length || 0} links created`,
    links
  );

  // Test 5: Fetch complete event with relations
  const { data: completeEvent, error: fetchError } = await supabase
    .from('calendar_events')
    .select(`
      *,
      event_participants(
        id,
        user:users(id, nama_lengkap),
        role,
        status
      ),
      calendar_todos(
        id,
        todo:workload(id, nama, status)
      )
    `)
    .eq('id', newEvent.id)
    .single();

  logTest(
    'Fetch complete event with relations',
    !fetchError && !!completeEvent,
    fetchError ? fetchError.message : 'Complete event fetched',
    completeEvent
  );

  // Cleanup: Delete test data
  console.log('\n🧹 Cleaning up test data...\n');
  
  await supabase.from('calendar_events').delete().eq('id', newEvent.id);
  console.log('   Cleaned up test event (cascade delete handles relations)');
}

async function testAPIEndpoints() {
  console.log('\n🌐 Testing API Endpoints...\n');

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  // Test 1: GET /api/calendar/events/enhanced
  try {
    const response = await fetch(`${baseUrl}/api/calendar/events/enhanced?limit=5`);
    const data = await response.json();
    
    logTest(
      'GET /api/calendar/events/enhanced',
      response.ok,
      response.ok ? `Fetched ${data.count || 0} events` : 'Failed to fetch events'
    );
  } catch (error: any) {
    logTest('GET /api/calendar/events/enhanced', false, error.message);
  }

  // Test 2: GET /api/workload/calendar-linked
  try {
    const response = await fetch(`${baseUrl}/api/workload/calendar-linked?limit=5`);
    const data = await response.json();
    
    logTest(
      'GET /api/workload/calendar-linked',
      response.ok,
      response.ok ? `Fetched ${data.count || 0} linked workload items` : 'Failed to fetch'
    );
  } catch (error: any) {
    logTest('GET /api/workload/calendar-linked', false, error.message);
  }

  // Test 3: POST /api/calendar/auto-complete (dry run)
  try {
    const response = await fetch(`${baseUrl}/api/calendar/auto-complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dry_run: true })
    });
    const data = await response.json();
    
    logTest(
      'POST /api/calendar/auto-complete (dry run)',
      response.ok,
      response.ok ? `Would process ${data.data?.events_to_process || 0} events` : 'Failed',
      data
    );
  } catch (error: any) {
    logTest('POST /api/calendar/auto-complete', false, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting Calendar-Workload Integration Tests\n');
  console.log('================================================\n');

  await testDatabaseSchema();
  await testDatabaseFunctions();
  await testEventCreationWithTodos();
  await testAPIEndpoints();

  // Summary
  console.log('\n================================================');
  console.log('📊 Test Summary\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  }
  
  console.log('\n================================================\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
});
