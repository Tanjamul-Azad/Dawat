import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { body, endpoint } from '@/server/http';
import { exchangeLink } from '@/server/guests';
export async function POST(request: Request) {
  return endpoint(request, async () => {
    const input = await body(
      request,
      z.object({ slug: uuid, token: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict(),
    );
    return exchangeLink(input.slug, input.token);
  });
}
