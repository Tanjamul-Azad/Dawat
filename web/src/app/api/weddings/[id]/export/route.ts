import { z } from 'zod';
import { uuid } from '@/features/production/contracts';
import { householdCsv, type ExportSnapshot } from '@/features/production/csv';
import { session } from '@/server/auth';
import { dbError, endpoint, HttpError, privateHeaders } from '@/server/http';
export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  return endpoint(request, async () => {
    if (request.headers.get('sec-fetch-site') === 'cross-site')
      throw new HttpError(403, 'ORIGIN', 'Please use the application to perform this action.');
    const wid = uuid.parse((await ctx.params).id);
    const params = new URL(request.url).searchParams;
    const { db } = await session();
    const result = await db.rpc('export_households', {
      p_wedding_id: wid,
      p_include_contacts: params.get('contacts') === '1',
      p_source: z.enum(['all','host','open']).parse(params.get('source') ?? 'all'),
      p_event_id: z.enum(['nikah', 'reception']).parse(params.get('event')),
      p_search: z
        .string()
        .max(120)
        .parse(params.get('search') ?? ''),
      p_status: z.enum(['all', 'pending', 'accepted', 'declined']).parse(params.get('status') ?? 'all'),
    });
    dbError(result.error);
    return new Response(householdCsv(result.data as unknown as ExportSnapshot), {
      headers: {
        ...privateHeaders,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="dawat-households.csv"',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  });
}
