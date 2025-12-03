#!/usr/bin/env node
// Backfill users.auth_uid by matching Supabase Auth users via email
// Usage: node scripts/backfill-auth-uid.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function listAllUsers() {
  let page = 1;
  const perPage = 1000;
  const all = [];
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    all.push(...data.users);
    if (data.users.length < perPage) break;
    page += 1;
  }
  return all;
}

async function run() {
  try {
    const authUsers = await listAllUsers();
    console.log(`Loaded ${authUsers.length} auth users`);

    // fetch app users
    const { data: appUsers, error: appErr } = await admin.from('users').select('id, email, auth_uid');
    if (appErr) throw appErr;

    for (const u of appUsers) {
      if (!u.email || u.auth_uid) continue;
      const match = authUsers.find((au) => (au.email || '').toLowerCase() === u.email.toLowerCase());
      if (!match) {
        console.warn(`No auth user for app user ${u.id} (${u.email})`);
        continue;
      }
      const { error: updErr } = await admin.from('users').update({ auth_uid: match.id }).eq('id', u.id);
      if (updErr) {
        console.error('Update failed for', u.id, updErr);
      } else {
        console.log('Updated', u.id, '->', match.id);
      }
    }

    console.log('Backfill complete');
  } catch (e) {
    console.error('Backfill failed:', e);
    process.exit(1);
  }
}

run();
