#!/usr/bin/env ts-node
/*
  tmp_rovodev_password_verification.ts
  - Memverifikasi keberadaan akun di Supabase Auth via SERVICE_ROLE
  - OPSIONAL: Mengatur password sementara (hanya jika dipanggil dengan argumen --set-password <email> <password>)
  - Tidak menyentuh tabel aplikasi. Hanya operasi Auth Admin dan read-only audit optional.

  Cara pakai:
  1) pnpm i (atau npm i) pastikan dep sudah terpasang
  2) ts-node scripts/tmp_rovodev_password_verification.ts --check <email1> <email2>
  3) ts-node scripts/tmp_rovodev_password_verification.ts --set-password <email> <NewPassw0rd!>

  PERINGATAN: --set-password akan MENGGANTI password user Auth Supabase.
*/
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing env NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

async function listUserByEmail(email: string) {
  let page = 1; const perPage = 1000;
  while (true) {
    const { data, error } = await (admin as any).auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const found = data.users.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
    if (found) return found;
    if (data.users.length < perPage) break;
    page += 1;
  }
  return null;
}

async function setPasswordByEmail(email: string, newPassword: string) {
  const user = await listUserByEmail(email);
  if (!user) throw new Error(`User not found in Supabase Auth: ${email}`);
  const { error } = await (admin as any).auth.admin.updateUserById(user.id, { password: newPassword });
  if (error) throw error;
  return { id: user.id };
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('Usage:');
    console.log('  --check <email1> [email2 ...]     Memeriksa user exist di Supabase Auth');
    console.log('  --set-password <email> <pass>     Mengganti password user di Supabase Auth');
    process.exit(0);
  }

  const cmd = args[0];
  if (cmd === '--check') {
    const emails = args.slice(1);
    if (!emails.length) throw new Error('Masukkan minimal 1 email');
    for (const email of emails) {
      process.stdout.write(`Checking ${email} ... `);
      const u = await listUserByEmail(email);
      if (u) {
        console.log(`FOUND (auth_id=${u.id})`);
      } else {
        console.log('NOT FOUND');
      }
    }
  } else if (cmd === '--set-password') {
    const email = args[1];
    const pass = args[2];
    if (!email || !pass) throw new Error('Gunakan: --set-password <email> <password>');
    console.log(`Setting password for ${email} ...`);
    const res = await setPasswordByEmail(email, pass);
    console.log(`OK. auth_id=${res.id}`);
  } else {
    throw new Error(`Unknown command: ${cmd}`);
  }
}

main().catch((e) => {
  console.error('ERROR:', e);
  process.exit(1);
});
