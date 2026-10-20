import { uuid } from '@/features/production/contracts';
import { correctionInput } from '@/features/production/guests';
import { session } from '@/server/auth';
import { body, dbError, endpoint, HttpError } from '@/server/http';
type Context = { params: Promise<{ id: string; hid: string }> };
export async function GET(request: Request, ctx: Context) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const wid = uuid.parse(p.id),
      hid = uuid.parse(p.hid);
    const { db } = await session();
    const gate = await db.from('households').select('id').eq('wedding_id', wid).eq('id', hid).maybeSingle();
    dbError(gate.error);
    if (!gate.data) throw new HttpError(404, 'UNAVAILABLE', 'Household unavailable.');
    const history = await db
      .from('response_changes')
      .select('id,event_id,source,reason,override_closed,created_at,previous,current_value')
      .eq('wedding_id', wid)
      .eq('household_id', hid)
      .order('change_sequence', { ascending: false })
      .limit(50);
    dbError(history.error);
    return { rows: history.data };
  });
}
export async function POST(request: Request, ctx: Context) {
  return endpoint(request, async () => {
    const p = await ctx.params;
    const { db } = await session();
    const input = await body(request, correctionInput);
    const result = await db.rpc('correct_response', {
      p_wedding_id: uuid.parse(p.id),
      p_household_id: uuid.parse(p.hid),
      p_key: uuid.parse(request.headers.get('Idempotency-Key')),
      p_body: input,
    });
    dbError(result.error);
    return result.data;
  });
}
