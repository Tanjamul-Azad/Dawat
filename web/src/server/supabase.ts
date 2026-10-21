import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { config } from './config';
import type { Database } from './database.types';
import { serverFetch } from './bounded-fetch';

export async function database() {
  const c = config();
  const jar = await cookies();
  return createServerClient<Database>(c.url, c.key, {
    global: { fetch: serverFetch },
    cookieOptions: { httpOnly: true, sameSite: 'lax', secure: c.origin.startsWith('https://'), path: '/' },
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (updates) => {
        try {
          for (const { name, value, options } of updates) jar.set(name, value, options);
        } catch {
          /* Server rendering is read-only; proxy refreshes the session. */
        }
      },
    },
  });
}
