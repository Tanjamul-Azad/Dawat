import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { safeReturnPath } from '@/features/production/navigation';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    const db = createServerClient(url, key, {
      cookieOptions: {
        httpOnly: true,
        secure: process.env.APP_ORIGIN?.startsWith('https://') ?? true,
        sameSite: 'lax',
        path: '/',
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (updates) => {
          for (const { name, value } of updates) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of updates) response.cookies.set(name, value, options);
        },
      },
    });
    const { data } = await db.auth.getClaims();
    if (!data?.claims && /^\/(dashboard|weddings|admin)(\/|$)/.test(request.nextUrl.pathname)) {
      const login = new URL('/auth/login/', request.url);
      login.searchParams.set('next', safeReturnPath(request.nextUrl.pathname));
      const redirect = NextResponse.redirect(login);
      for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
      redirect.headers.set('Cache-Control', 'private, no-store');
      redirect.headers.set('Vary', 'Cookie');
      return redirect;
    }
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Vary', 'Cookie');
  return response;
}
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/weddings/:path*',
    '/admin/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/i/:path*',
  ],
};
