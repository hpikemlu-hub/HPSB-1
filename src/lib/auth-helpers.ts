import { createClientSupabaseClient } from './supabase/client';
import { cookies } from 'next/headers';

export async function signOut() {
  const supabase = createClientSupabaseClient();
  
  try {
    // Clear Supabase session
    await supabase.auth.signOut({ scope: 'global' });
    
    // Clear localStorage on client side
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('supabase.auth.token');
      localStorage.clear();
      
      // Clear session storage
      sessionStorage.clear();
    }
    
    // Redirect to login page
    window.location.href = '/auth/login';
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Force logout even if Supabase fails
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }
    
    return { success: false, error };
  }
}

export function forceLogout() {
  if (typeof window !== 'undefined') {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/auth/login';
  }
}
