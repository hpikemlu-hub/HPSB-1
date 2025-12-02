import { NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase/admin';

// POST /api/auth/resolve-username
export async function POST(req: Request) {
  try {
    const { username } = await req.json();
    
    if (!username) {
      return NextResponse.json({ success: false, error: 'Username required' }, { status: 400 });
    }

    // If input contains @, treat as email
    if (username.includes('@')) {
      return NextResponse.json({ success: true, email: username });
    }

    const supabase = createAdminSupabaseClient();
    
    // Query users table for email using service role (bypass RLS)
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq('username', username)
      .single();
      
    if (error || !user?.email) {
      return NextResponse.json({ success: false, error: 'Username tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, email: user.email });
    
  } catch (e: any) {
    console.error('Resolve username error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}