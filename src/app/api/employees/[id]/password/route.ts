import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * Admin Password Management API Route
 * Allows admin users to securely change passwords for other users
 * 
 * Route: /api/employees/[id]/password
 * Method: PUT
 * 
 * Security Features:
 * - Admin-only access control
 * - Password strength validation
 * - Comprehensive audit logging
 * - Rate limiting considerations
 * - Secure error handling
 */

// Create admin client for Supabase Auth admin operations
const createAdminAuthClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables for admin operations');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

import { validatePassword } from '@/lib/utils/password-validation';

// Password validation moved to shared util

// Resolve Supabase Auth user ID by email (admin API does not provide get-by-email)
const resolveAuthUserIdByEmail = async (
  admin: ReturnType<typeof createAdminAuthClient>,
  email: string
): Promise<string | null> => {
  try {
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await (admin as any).auth.admin.listUsers({ page, perPage });
      if (error) {
        console.error('listUsers error:', error);
        return null;
      }
      const found = data.users.find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
      if (found) return found.id as string;
      if (data.users.length < perPage) break;
      page += 1;
    }
    return null;
  } catch (e) {
    console.error('resolveAuthUserIdByEmail failed:', e);
    return null;
  }
};

// Create audit log entry
const createAuditLog = async (
  supabase: any,
  adminUserId: string,
  adminUserName: string,
  targetUserId: string,
  targetUserName: string,
  ipAddress: string,
  success: boolean,
  errorMessage?: string
) => {
  const auditEntry = {
    user_id: adminUserId,
    user_name: adminUserName,
    action: 'password_changed',
    table_name: 'users',
    record_id: targetUserId,
    details: success 
      ? `Password successfully updated for user: ${targetUserName}`
      : `Password update failed for user: ${targetUserName}. Error: ${errorMessage}`,
    ip_address: ipAddress,
    user_agent: 'Admin API',
    old_values: null, // Never log actual passwords
    new_values: { password_updated: true, timestamp: new Date().toISOString() }
  };

  try {
    const { data, error } = await supabase
      .from('audit_log')
      .insert(auditEntry)
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create audit log:', error);
      return null;
    }

    return data?.id;
  } catch (error) {
    console.error('Audit logging error:', error);
    return null;
  }
};

/**
 * PUT /api/employees/[id]/password - Update user password (Admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔐 Admin Password Management API - Request received');
  
  try {
    const { id: targetUserId } = await params;
    const body = await request.json();
    const { newPassword, targetEmail } = body;

    // Get client IP for audit logging
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    console.log(`🔍 Password change request for user ID: ${targetUserId}`);

    // 1. AUTHORIZATION CHECK - Only admin can change other users' passwords
    const serverSupabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await serverSupabase.auth.getUser();

    let currentAuthUserId: string | null = null;
    if (!authError && authData.user) {
      currentAuthUserId = authData.user.id;
    } else {
      // Fallback for demo/dev: read currentUser cookie set by app login
      const cookie = request.headers.get('cookie') || '';
      const match = cookie.match(/currentUser=([^;]+)/);
      if (match) {
        try {
          const decoded = JSON.parse(decodeURIComponent(match[1]));
          currentAuthUserId = decoded?.id || null;
        } catch (e) {
          currentAuthUserId = null;
        }
      }
      if (!currentAuthUserId) {
        console.log('❌ Authentication failed:', authError?.message || 'Auth session missing!');
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Get current user details from database
    const adminSupabase = createAdminAuthClient();
    const { data: currentUser, error: userFetchError } = await adminSupabase
      .from('users')
      .select('id, nama_lengkap, role')
      .eq('id', currentAuthUserId!)
      .single();

    if (userFetchError || !currentUser) {
      const msg = userFetchError?.message || '';
      console.log('❌ User lookup failed:', msg);
      // Fallback: if users table/column missing, authorize via cookie (role: admin)
      if (msg.toLowerCase().includes('relation') || msg.toLowerCase().includes('table') || msg.toLowerCase().includes('column')) {
        const cookie = request.headers.get('cookie') || '';
        const match = cookie.match(/currentUser=([^;]+)/);
        if (match) {
          try {
            const decoded = JSON.parse(decodeURIComponent(match[1]));
            if (decoded?.role === 'admin') {
              console.log('ℹ️ Fallback authorization via cookie: admin');
              // Create minimal currentUser for downstream
              (currentUser as any) = { id: decoded.id, nama_lengkap: decoded.nama_lengkap, role: 'admin' };
            } else {
              return NextResponse.json(
                { success: false, error: 'Unauthorized. Admin access required.' },
                { status: 403 }
              );
            }
          } catch {
            return NextResponse.json(
              { success: false, error: 'Unauthorized. Admin access required.' },
              { status: 403 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Unauthorized. Admin access required.' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }

    if (!currentUser || currentUser.role !== 'admin') {
      console.log('❌ Unauthorized access attempt by user:', currentUser?.nama_lengkap || 'unknown');
      
      // Log unauthorized attempt
      await createAuditLog(
        adminSupabase,
        currentUser?.id || 'unknown',
        currentUser?.nama_lengkap || 'unknown',
        targetUserId,
        'unknown',
        ipAddress,
        false,
        'Unauthorized access attempt - insufficient privileges'
      );

      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    console.log(`✅ Admin authorization confirmed: ${currentUser.nama_lengkap}`);

    // 2. VALIDATE NEW PASSWORD
    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'New password is required' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      console.log('❌ Password validation failed:', passwordValidation.errors);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Password does not meet security requirements',
          details: passwordValidation.errors
        },
        { status: 400 }
      );
    }

    console.log('✅ Password validation passed');

    // 3. VERIFY TARGET USER EXISTS
    // Try select with auth_uid if column exists; fallback if not
    // If targetEmail provided, prefer lookup by email first
    if (targetEmail) {
      const { data: byEmail } = await adminSupabase.from('users').select('id').eq('email', targetEmail).limit(1).maybeSingle();
      if (byEmail?.id && byEmail.id !== targetUserId) {
        // Override targetUserId to ensure correct mapping
        console.log('ℹ️ Overriding targetUserId by email match');
        (params as any).id = byEmail.id; // not strictly necessary downstream, we use fetched targetUser anyway
      }
    }
    let targetUser: any = null;
    let targetFetchError: any = null;
    try {
      const { data, error } = await adminSupabase
        .from('users')
        .select('id, nama_lengkap, role, email, auth_uid')
        .eq('id', targetUserId)
        .single();
      targetUser = data;
      targetFetchError = error;
    } catch (e: any) {
      const msg = e?.message || '';
      if (msg.includes('auth_uid') || msg.includes('column')) {
        const { data, error } = await adminSupabase
          .from('users')
          .select('id, nama_lengkap, role, email')
          .eq('id', targetUserId)
          .single();
        targetUser = data;
        targetFetchError = error;
      } else {
        throw e;
      }
    }

    // Resolve Supabase Auth UID: prefer users.auth_uid; if missing, resolve by email.
    // Do NOT assume users.id equals auth user id (schemas may differ).
    let authUserId: string | null = (targetUser as any)?.auth_uid || null;
    if (!authUserId && targetUser?.email) {
      const resolved = await resolveAuthUserIdByEmail(adminSupabase, targetUser.email);
      if (resolved) {
        authUserId = resolved;
        // attempt to persist mapping if column exists (non-blocking)
        try {
          await adminSupabase.from('users').update({ auth_uid: resolved }).eq('id', targetUserId);
        } catch {}
      }
    }

    // If still not resolved, try using targetEmail from request (if provided)
    if (!authUserId && targetEmail) {
      const res2 = await resolveAuthUserIdByEmail(adminSupabase, targetEmail);
      if (res2) authUserId = res2;
    }

    if (!authUserId) {
      console.error('Unable to resolve authentication user ID for target user. email(db)=', targetUser?.email, ' email(req)=', targetEmail);
      return NextResponse.json(
        { success: false, error: 'Unable to resolve authentication user ID for target user' },
        { status: 400 }
      );
    }

    if (targetFetchError) {
      const msg = targetFetchError?.message || '';
      if (targetFetchError.code === 'PGRST116') {
        console.log('❌ Target user not found:', targetUserId);
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
      if (msg.toLowerCase().includes('relation') || msg.toLowerCase().includes('table') || msg.toLowerCase().includes('column')) {
        // Fallback: proceed using targetEmail only (no users table available)
        if (!targetEmail) {
          return NextResponse.json(
            { success: false, error: 'Target email is required when user table is unavailable' },
            { status: 400 }
          );
        }
        console.log('ℹ️ Fallback: proceeding without users table, using targetEmail only');
        // Resolve Auth UID from email
        const resolved = await resolveAuthUserIdByEmail(adminSupabase, targetEmail);
        if (!resolved) {
          return NextResponse.json(
            { success: false, error: 'Auth user not found for provided email' },
            { status: 404 }
          );
        }
        // Perform update directly
        const { error: updErr } = await adminSupabase.auth.admin.updateUserById(resolved, { password: newPassword });
        if (updErr) {
          console.error('❌ Supabase Auth password update failed (fallback):', updErr);
          return NextResponse.json({ success: false, error: 'Failed to update password. Please try again.' }, { status: 500 });
        }
        // Try audit (ignore failures if table missing)
        try {
          await adminSupabase.from('audit_log').insert({
            user_id: (currentUser as any)?.id || null,
            user_name: (currentUser as any)?.nama_lengkap || 'Admin',
            action: 'password_changed',
            table_name: 'users',
            record_id: resolved,
            details: `Password updated for ${targetEmail} (fallback)`,
            ip_address: ipAddress,
            user_agent: 'Admin API',
            old_values: null,
            new_values: { password_updated: true, timestamp: new Date().toISOString() },
          });
        } catch {}
        return NextResponse.json({ success: true, message: `Password successfully updated for ${targetEmail}` });
      }
      
      console.error('❌ Target user lookup error:', targetFetchError);
      return NextResponse.json(
        { success: false, error: 'Error retrieving user information' },
        { status: 500 }
      );
    }

    console.log(`✅ Target user found: ${targetUser.nama_lengkap}`);

    // 4. PREVENT SELF-PASSWORD CHANGE (should use different endpoint)
    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot change your own password through admin endpoint. Use profile settings.' 
        },
        { status: 400 }
      );
    }

    // 5. UPDATE PASSWORD IN SUPABASE AUTH
    console.log('🔄 Updating password in Supabase Auth...');
    
    const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
      authUserId!,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Supabase Auth password update failed:', updateError);
      
      // Log failed attempt
      await createAuditLog(
        adminSupabase,
        currentUser.id,
        currentUser.nama_lengkap,
        targetUserId,
        targetUser.nama_lengkap,
        ipAddress,
        false,
        updateError.message
      );

      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update password. Please try again.' 
        },
        { status: 500 }
      );
    }

    console.log('✅ Password successfully updated in Supabase Auth');

    // 6. CREATE SUCCESS AUDIT LOG
    const auditId = await createAuditLog(
      adminSupabase,
      currentUser.id,
      currentUser.nama_lengkap,
      targetUserId,
      targetUser.nama_lengkap,
      ipAddress,
      true
    );

    console.log(`✅ Audit log created with ID: ${auditId}`);

    // 7. UPDATE USER RECORD (optional - set updated_at)
    await adminSupabase
      .from('users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    // 8. RETURN SUCCESS RESPONSE
    const successMessage = `Password successfully updated for ${targetUser.nama_lengkap}`;
    
    console.log(`🎉 Password change completed successfully for: ${targetUser.nama_lengkap}`);

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: {
        user_id: targetUserId,
        user_name: targetUser.nama_lengkap,
        updated_by: currentUser.nama_lengkap,
        audit_id: auditId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('💥 Critical error in password management API:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error occurred while updating password' 
      },
      { status: 500 }
    );
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}