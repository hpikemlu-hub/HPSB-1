import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { validatePassword } from '@/lib/utils/password-validation';

// Create admin client only for audit log (if RLS prevents user insert)
const createAdminClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
};

export async function POST(req: NextRequest) {
  try {
    const server = await createServerSupabaseClient();

    // 1) Auth: must be logged in
    const { data: authData, error: authError } = await server.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: 'Both current and new password are required' }, { status: 400 });
    }

    // 2) Validate new password strength
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: 'Password does not meet security requirements', details: validation.errors },
        { status: 400 }
      );
    }

    // 3) Re-authenticate using current password (generic error on failure)
    const email = authData.user.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'Unable to verify user email' }, { status: 400 });
    }

    const { error: reauthError } = await server.auth.signInWithPassword({ email, password: currentPassword });
    if (reauthError) {
      return NextResponse.json({ success: false, error: 'Invalid current credentials' }, { status: 400 });
    }

    // 4) Update password for current session user
    const { error: updateError } = await server.auth.updateUser({ password: newPassword });
    if (updateError) {
      return NextResponse.json({ success: false, error: 'Failed to update password' }, { status: 500 });
    }

    // 5) Audit log (do not store passwords)
    try {
      // Prefer server (anon) if RLS allows insert to audit_log for own entries, else admin
      const admin = createAdminClient();
      await admin.from('audit_log').insert({
        user_id: authData.user.id,
        user_name: authData.user.user_metadata?.full_name || authData.user.email || 'Unknown',
        action: 'password_self_changed',
        table_name: 'users',
        record_id: authData.user.id,
        details: 'User changed own password',
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        user_agent: 'Self Password API',
        old_values: null,
        new_values: { password_updated: true, timestamp: new Date().toISOString() },
      });
    } catch (e) {
      console.warn('Audit log failed (non-blocking):', e);
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (e) {
    console.error('Self password change failed:', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: false, error: 'Method not allowed' }, { status: 405 });
}
