import { createClientSupabaseClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClientSupabaseClient();
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Create response with success
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
    
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Return success anyway to clear client
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cleared' 
    });
    
    return response;
  }
}

export async function GET() {
  return POST(new NextRequest('http://localhost/api/auth/logout'));
}
