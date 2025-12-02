import { createClientSupabaseClient } from '@/lib/supabase/client';
import Cookies from 'js-cookie';

export interface AuthUser {
  id: string;
  username?: string;
  email: string;
  nama_lengkap: string;
  role: string;
  nip?: string;
  golongan?: string;
  jabatan?: string;
  is_active?: boolean;
  auth_id: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface SessionData {
  id: string;
  username?: string;
  email: string;
  nama_lengkap: string;
  role: string;
  nip?: string;
  golongan?: string;
  jabatan?: string;
  auth_id: string;
}

// Helper function to resolve username/email to actual email using server-side API
async function resolveToEmail(input: string): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/resolve-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: input })
    });
    
    const json = await res.json();
    
    if (!json.success) {
      return null;
    }
    
    return json.email;
  } catch (e) {
    console.error('Resolve username error:', e);
    return null;
  }
}

// Main authentication function supporting email OR username
export async function authenticateUser(usernameOrEmail: string, password: string): Promise<AuthResult> {
  const supabase = createClientSupabaseClient();
  
  try {
    // Step 1: Resolve input to email (support both email and username)
    const email = await resolveToEmail(usernameOrEmail);
    
    if (!email) {
      return {
        success: false,
        error: 'Username atau email tidak ditemukan'
      };
    }

    // Step 2: Authenticate with Supabase Auth using resolved email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (authError) {
      console.error('Auth error:', authError);
      return {
        success: false,
        error: 'Username/email atau password salah'
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Login gagal'
      };
    }

    // Step 3: Fetch complete user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, email, nama_lengkap, role, nip, golongan, jabatan, is_active')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      console.error('User data error:', userError);
      return {
        success: false,
        error: 'Data pengguna tidak ditemukan'
      };
    }

    // Step 4: Check if user is active
    if (userData.is_active === false) {
      return {
        success: false,
        error: 'Akun Anda tidak aktif. Hubungi administrator.'
      };
    }

    // Step 5: Return success with complete user data
    const user: AuthUser = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      nama_lengkap: userData.nama_lengkap,
      role: userData.role,
      nip: userData.nip,
      golongan: userData.golongan,
      jabatan: userData.jabatan,
      is_active: userData.is_active,
      auth_id: authData.user.id
    };

    return {
      success: true,
      user: user
    };
    
  } catch (err) {
    console.error('Authentication error:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem. Silakan coba lagi.'
    };
  }
}

// Create session data from authenticated user
export function createSessionData(user: AuthUser): SessionData {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    nama_lengkap: user.nama_lengkap,
    role: user.role,
    nip: user.nip,
    golongan: user.golongan,
    jabatan: user.jabatan,
    auth_id: user.auth_id
  };
}

// Set user session in cookie
export function setUserSession(sessionData: SessionData): void {
  Cookies.set('user', JSON.stringify(sessionData), {
    expires: 1,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  });
}

// Get current user session from cookie (works in browser)
export function getUserSession(): SessionData | null {
  try {
    if (typeof window === 'undefined') return null; // Server-side check
    const userCookie = Cookies.get('user');
    if (!userCookie) return null;
    return JSON.parse(userCookie) as SessionData;
  } catch {
    return null;
  }
}

// Alternative session getter using document.cookie (for SSR compatibility)
export function getUserSessionCompat(): SessionData | null {
  try {
    if (typeof window === 'undefined') return null;
    const userCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user='));
    if (!userCookie) return null;
    return JSON.parse(decodeURIComponent(userCookie.split('=')[1])) as SessionData;
  } catch {
    return null;
  }
}

// Clear user session
export function clearUserSession(): void {
  Cookies.remove('user');
}