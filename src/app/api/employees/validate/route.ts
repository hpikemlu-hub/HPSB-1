import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Employee Validation API
 * Validates username, NIP, and email uniqueness
 */

// Create admin client for server-side operations
const createAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

/**
 * POST /api/employees/validate - Validate employee data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, nip, email, excludeId } = body;

    const supabase = createAdminClient();
    const validationResults: any = {
      valid: true,
      errors: {}
    };

    // Validate username uniqueness
    if (username) {
      let usernameQuery = supabase
        .from('users')
        .select('id')
        .eq('username', username);

      if (excludeId) {
        usernameQuery = usernameQuery.neq('id', excludeId);
      }

      const { data: usernameExists } = await usernameQuery.single();

      if (usernameExists) {
        validationResults.valid = false;
        validationResults.errors.username = 'Username sudah digunakan';
      }
    }

    // Validate NIP uniqueness (only for non-admin users)
    if (nip && nip.trim() !== '') {
      let nipQuery = supabase
        .from('users')
        .select('id, role')
        .eq('nip', nip);

      if (excludeId) {
        nipQuery = nipQuery.neq('id', excludeId);
      }

      const { data: nipExists } = await nipQuery.single();

      if (nipExists) {
        validationResults.valid = false;
        validationResults.errors.nip = 'NIP sudah terdaftar';
      }
    }

    // Validate email uniqueness
    if (email && email.trim() !== '') {
      let emailQuery = supabase
        .from('users')
        .select('id')
        .eq('email', email);

      if (excludeId) {
        emailQuery = emailQuery.neq('id', excludeId);
      }

      const { data: emailExists } = await emailQuery.single();

      if (emailExists) {
        validationResults.valid = false;
        validationResults.errors.email = 'Email sudah terdaftar';
      }
    }

    return NextResponse.json({
      success: true,
      data: validationResults
    });

  } catch (error: any) {
    console.error('Validation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}