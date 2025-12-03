import { createClientSupabaseClient } from './supabase/client';

export interface SessionData {
  id: string;
  email: string;
  user_metadata?: any;
  created_at?: string;
}

export async function signOut() {
  const supabase = createClientSupabaseClient();
  
  try {
    await supabase.auth.signOut({ scope: 'global' });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentUser');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/auth/login';
    }
    
    return { success: false, error };
  }
}

export async function authenticateUser(username: string, password: string) {
  const supabase = createClientSupabaseClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
    });

    if (error) throw error;
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

export function createSessionData(user: any): SessionData {
  return {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata || {},
    created_at: user.created_at,
  };
}

export function getCurrentUser(): SessionData | null {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
}

export async function getUserSession(): Promise<SessionData | null> {
  const supabase = createClientSupabaseClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    if (!session?.user) return null;
    
    return createSessionData(session.user);
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
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