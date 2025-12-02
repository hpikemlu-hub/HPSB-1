import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check both Supabase session and our custom cookie session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Also check for user cookie session
  const userCookie = req.cookies.get('user')?.value;
  let hasUserSession = false;
  if (userCookie) {
    try {
      const userData = JSON.parse(userCookie);
      hasUserSession = !!(userData.id && userData.email && userData.role);
    } catch {
      hasUserSession = false;
    }
  }

  const isAuthenticated = session || hasUserSession;

  // Define protected routes
  const protectedRoutes = ['/dashboard', '/workload', '/employees', '/calendar', '/reports', '/e-kinerja', '/history'];
  const authRoutes = ['/auth/login', '/auth/signup'];
  
  const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if accessing protected route without session
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/auth/login';
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if already logged in and accessing auth pages
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect root to dashboard if logged in, otherwise to login
  if (req.nextUrl.pathname === '/') {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = isAuthenticated ? '/dashboard' : '/auth/login';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};