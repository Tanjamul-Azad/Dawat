// Run with: node --env-file=.env.local scripts/cleanup-media.mjs
// Schedule on the trusted server; never expose the processor key to a browser.
import { createClient } from '@supabase/supabase-js';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_MEDIA_SECRET_KEY;
if (!url || !key) throw new Error('Media processor environment is required.');
const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await db.rpc('media_cleanup_batch', {});
if (error) throw new Error('Media cleanup lookup failed.');
let completed = 0;
for (const item of data ?? []) {
  const paths = [480, 960, 1600].map((size) => `${item.prefix}/${size}.webp`);
  const removed = await db.storage.from('wedding-media').remove(paths);
  if (removed.error) continue;
  const ack = await db.rpc('media_cleanup_batch', { p_done: item.lease });
  if (!ack.error) completed++;
}
console.log(
  `Media cleanup: ${completed}/${data?.length ?? 0} eligible attempts completed; referenced publications retained.`,
);
