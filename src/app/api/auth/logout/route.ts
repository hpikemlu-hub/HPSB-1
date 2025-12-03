import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Create response with redirect
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
    
    // Clear all auth cookies
    response.cookies.delete('supabase-auth-token');
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    // Set additional headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
    
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if logout fails, return success to clear client
    const response = NextResponse.json({ 
      success: true, 
      message: 'Session cleared' 
    });
    
    // Force clear cookies
    response.cookies.delete('supabase-auth-token');
    response.cookies.delete('sb-access-token'); 
    response.cookies.delete('sb-refresh-token');
    
    return response;
  }
}

export async function GET() {
  return POST(new NextRequest('http://localhost/api/auth/logout'));
}
