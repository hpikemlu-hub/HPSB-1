#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const http = require('http');
require('dotenv').config({ path: 'workload-app/.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function getAdminAndTarget() {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: admins, error: e1 } = await admin.from('users').select('id, nama_lengkap, role, email').eq('role', 'admin').limit(1);
  if (e1 || !admins?.length) throw new Error('No admin user found');
  const adminUser = admins[0];
  const { data: targets, error: e2 } = await admin.from('users').select('id, nama_lengkap, role, email').neq('role', 'admin').limit(1);
  if (e2 || !targets?.length) throw new Error('No target user found');
  const target = targets[0];
  return { adminUser, target };
}

function putChangePassword(targetId, cookie, newPassword) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(JSON.stringify({ newPassword }), 'utf8');
    const req = http.request({
      hostname: 'localhost', port: 3000, path: `/api/employees/${targetId}/password`, method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Content-Length': payload.length, 'Cookie': cookie }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    const { adminUser, target } = await getAdminAndTarget();
    const cookieVal = encodeURIComponent(JSON.stringify({ id: adminUser.id, role: 'admin', nama_lengkap: adminUser.nama_lengkap }));
    const cookie = `currentUser=${cookieVal}; path=/;`;
    const res = await putChangePassword(target.id, cookie, 'Admin123');
    console.log('Response:', res.status, res.body);
  } catch (e) {
    console.error('Test failed:', e);
    process.exit(1);
  }
})();
