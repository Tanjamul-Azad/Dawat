import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { config } from './config';
import { HttpError } from './http';
// Deliberately isolated: ordinary owner/guest database queries continue to use RLS sessions.
export function mediaProcessor() {
  const key = process.env.SUPABASE_MEDIA_SECRET_KEY;
  if (!key)
    throw new HttpError(
      503,
      'MEDIA_SETUP_PENDING',
      'Photo storage is being configured. Your existing draft is safe.',
    );
  return createClient<Database>(config().url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
