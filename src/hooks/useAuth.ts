import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession, type SessionData } from '@/lib/auth-helpers';

export function useAuth(requireAuth: boolean = true) {
  const [user, setUser] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Enhanced session reading with multiple fallback methods
  const getUserSessionCompat = useCallback((): SessionData | null => {
    try {
      // Method 1: Try cookie reading
      const cookies = document.cookie.split(';');
      const userCookie = cookies.find(c => c.trim().startsWith('user='));
      if (userCookie) {
        const userData = decodeURIComponent(userCookie.split('=')[1]);
        const sessionData = JSON.parse(userData);
        if (sessionData?.id && sessionData?.email && sessionData?.role) {
          return sessionData;
        }
      }

      // Method 2: Try localStorage fallback
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        const sessionData = JSON.parse(currentUser);
        if (sessionData?.authenticated && sessionData?.user?.id) {
          return sessionData.user;
        }
      }

      return null;
    } catch (error) {
      console.warn('Session fallback reading error:', error);
      return null;
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // Primary method: Use auth helper
      let sessionData = getUserSession();
      
      // Fallback method: Compatible session reading
      if (!sessionData) {
        sessionData = getUserSessionCompat();
      }
      
      if (sessionData?.id && sessionData?.email && sessionData?.role) {
        setUser(sessionData);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      // Only redirect after auth check is complete and we're sure there's no session
      if (requireAuth && authChecked) {
        console.log('No valid session found, redirecting to login...');
        // Prevent race conditions with delayed redirect
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
      }
      
    } catch (error) {
      console.error('Auth check error:', error);
      if (requireAuth && authChecked) {
        setTimeout(() => {
          router.push('/auth/login');
        }, 100);
      }
    } finally {
      setAuthChecked(true);
      setLoading(false);
    }
  }, [router, requireAuth, getUserSessionCompat, authChecked]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = () => {
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    router.push('/auth/login');
  };

  return { user, loading, logout };
}