import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// POST /api/auth/resolve-username
export async function POST(req: Request) {
  // Set CORS headers
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://hpsb.netlify.app' : '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  headers.set('Content-Type', 'application/json');

  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'Username required' },
        { status: 400, headers }
      );
    }

    // If input contains @, treat as email
    if (username.includes('@')) {
      return NextResponse.json(
        { success: true, email: username },
        { status: 200, headers }
      );
    }

    const supabase = createAdminSupabaseClient();

    // Query users table for email using service role (bypass RLS)
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .single();

    if (error || !user?.email) {
      return NextResponse.json(
        { success: false, error: 'Username tidak ditemukan' },
        { status: 404, headers }
      );
    }

    return NextResponse.json(
      { success: true, email: user.email },
      { status: 200, headers }
    );

  } catch (e: any) {
    console.error('Resolve username error:', e);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500, headers }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  const headers = new Headers();
  headers.set('Access-Control-Allow-Origin', process.env.NODE_ENV === 'production' ? 'https://hpsb.netlify.app' : '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new Response(null, {
    status: 200,
    headers,
  });
}