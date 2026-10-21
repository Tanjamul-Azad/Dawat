import { config, emailSignInReady } from '@/server/config';
import { privateHeaders } from '@/server/http';
export const dynamic = 'force-dynamic';
// Liveness/configuration only, not a database/SMTP delivery or full workflow guarantee.
export async function GET() {
  let ready = false;
  try {
    config();
    const ring = JSON.parse(process.env.GUEST_LINK_KEYS ?? '{}');
    const id = process.env.GUEST_LINK_KEY_ID ?? '';
    ready = Boolean(
      id &&
        ring[id] &&
        Buffer.from(ring[id], 'base64').length === 32 &&
        process.env.SUPABASE_MEDIA_SECRET_KEY?.trim() &&
        emailSignInReady(),
    );
  } catch {
    /* Do not expose configuration values or diagnostics publicly. */
  }
  return Response.json(
    { status: ready ? 'ok' : 'unavailable' },
    { status: ready ? 200 : 503, headers: privateHeaders },
  );
}
