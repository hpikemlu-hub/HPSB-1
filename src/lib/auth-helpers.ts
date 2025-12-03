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

// Login helpers for authentication
export async function authenticateUser(username: string, password: string) {
  const supabase = createClientSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) {
      throw error;
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

export function setUserSession(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

export function createSessionData(user: any) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata || {},
    created_at: user.created_at,
  };
}

export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
}

export async function checkAuth() {
  const supabase = createClientSupabaseClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    
    return session;
  } catch (error) {
    console.error('Auth check error:', error);
    return null;
  }
}
