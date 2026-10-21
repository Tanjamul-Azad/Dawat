import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { safeReturnPath } from '@/features/production/navigation';
import { serverFetch } from '@/server/bounded-fetch';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) {
    const db = createServerClient(url, key, {
      global: { fetch: serverFetch },
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
    const { data, error } = await db.auth.getClaims();
    // An upstream outage is not evidence of sign-out. The page/API still verifies the user.
    const unavailable = error && ((error.status ?? 0) >= 500 || error.name === 'AuthRetryableFetchError');
    if (
      !data?.claims &&
      !unavailable &&
      /^\/(dashboard|weddings|admin)(\/|$)/.test(request.nextUrl.pathname)
    ) {
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
