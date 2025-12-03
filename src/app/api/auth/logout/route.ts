import { createClientSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientSupabaseClient();
    await supabase.auth.signOut();
    
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
    
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json({ 
      success: true, 
      message: 'Session cleared' 
    });
  }
}

export async function GET() {
  return POST(new NextRequest('http://localhost/api/auth/logout'));
}