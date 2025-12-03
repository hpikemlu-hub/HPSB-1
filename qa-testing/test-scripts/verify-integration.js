/**
 * Integration Verification Script (JavaScript version)
 * Tests Calendar <-> TodoList <-> Dashboard integration
 * Run: node qa-testing/test-scripts/verify-integration.js
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verifyIntegration() {
  console.log('\n🔗 CALENDAR-TODO INTEGRATION VERIFICATION\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Check business trips with todos
    console.log('\n📋 Test 1: Business Trips with Linked Todos');
    const { data: trips, error: tripsError } = await supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        start_date,
        end_date,
        is_business_trip,
        calendar_todos (
          id,
          auto_completed,
          todo:workload (
            id,
            nama,
            status,
            user_id
          )
        )
      `)
      .eq('is_business_trip', true)
      .limit(5);

    if (tripsError) {
      console.error('❌ Error:', tripsError.message);
    } else {
      console.log(`✅ Found ${trips?.length || 0} business trips`);
      trips?.forEach((trip) => {
        const todoCount = trip.calendar_todos?.length || 0;
        console.log(`   - ${trip.title}: ${todoCount} linked todos`);
      });
    }

    // Test 2: Check auto-completed todos
    console.log('\n⏰ Test 2: Auto-Completed Todos');
    const { data: autoCompleted, error: acError } = await supabase
      .from('calendar_todos')
      .select('*')
      .eq('auto_completed', true)
      .limit(10);

    if (acError) {
      console.error('❌ Error:', acError.message);
    } else {
      console.log(`✅ Found ${autoCompleted?.length || 0} auto-completed todos`);
    }

    // Test 3: Check events with participants
    console.log('\n👥 Test 3: Events with Participants');
    const { data: withParticipants, error: partError } = await supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        event_participants (
          user:users (
            nama_lengkap
          )
        )
      `)
      .limit(5);

    if (partError) {
      console.error('❌ Error:', partError.message);
    } else {
      console.log(`✅ Checked ${withParticipants?.length || 0} events`);
      withParticipants?.forEach((event) => {
        const partCount = event.event_participants?.length || 0;
        console.log(`   - ${event.title}: ${partCount} participants`);
      });
    }

    // Test 4: Check ongoing trips
    console.log('\n🚀 Test 4: Ongoing Business Trips');
    const now = new Date().toISOString();
    const { data: ongoing, error: ongoingError } = await supabase
      .from('calendar_events')
      .select('id, title, start_date, end_date')
      .eq('is_business_trip', true)
      .lte('start_date', now)
      .gte('end_date', now);

    if (ongoingError) {
      console.error('❌ Error:', ongoingError.message);
    } else {
      console.log(`✅ Found ${ongoing?.length || 0} ongoing trips`);
      ongoing?.forEach((trip) => {
        console.log(`   - ${trip.title} (${trip.start_date} to ${trip.end_date})`);
      });
    }

    // Test 5: Check upcoming trips
    console.log('\n📅 Test 5: Upcoming Business Trips');
    const { data: upcoming, error: upcomingError } = await supabase
      .from('calendar_events')
      .select('id, title, start_date, end_date')
      .eq('is_business_trip', true)
      .gt('start_date', now)
      .order('start_date', { ascending: true })
      .limit(5);

    if (upcomingError) {
      console.error('❌ Error:', upcomingError.message);
    } else {
      console.log(`✅ Found ${upcoming?.length || 0} upcoming trips`);
      upcoming?.forEach((trip) => {
        console.log(`   - ${trip.title} (starts: ${trip.start_date})`);
      });
    }

    // Test 6: Check past trips (should be auto-completed)
    console.log('\n⏮️  Test 6: Past Business Trips (Auto-Complete Candidates)');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const { data: past, error: pastError } = await supabase
      .from('calendar_events')
      .select(`
        id,
        title,
        end_date,
        calendar_todos (
          id,
          auto_completed,
          auto_completed_at
        )
      `)
      .eq('is_business_trip', true)
      .lt('end_date', yesterday.toISOString())
      .limit(10);

    if (pastError) {
      console.error('❌ Error:', pastError.message);
    } else {
      console.log(`✅ Found ${past?.length || 0} past trips`);
      past?.forEach((trip) => {
        const allCompleted = trip.calendar_todos?.every((ct) => ct.auto_completed);
        const status = allCompleted ? '✅ Completed' : '⚠️  Pending';
        console.log(`   - ${trip.title}: ${status}`);
      });
    }

    // Test 7: Check auto-complete logs
    console.log('\n📊 Test 7: Auto-Complete Logs');
    const { data: logs, error: logsError } = await supabase
      .from('auto_complete_log')
      .select('*')
      .order('execution_time', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('❌ Error:', logsError.message);
    } else {
      console.log(`✅ Found ${logs?.length || 0} log entries`);
      logs?.forEach((log) => {
        console.log(`   - ${log.event_title}: ${log.todos_completed} todos (${log.status})`);
      });
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Integration verification complete!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

verifyIntegration();
