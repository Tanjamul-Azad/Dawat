import { paymentCommand } from '@/features/production/sales';
import { uuid } from '@/features/production/contracts';
import { session, staffSession } from '@/server/auth';
import { body, dbError, endpoint } from '@/server/http';
export async function POST(request: Request) {
  return endpoint(request, async () => {
    const input = await body(request, paymentCommand);
    const { db } = await (input.kind === 'submit' ? session() : staffSession());
    const result = await db.rpc('payment_submission_command', {
      p_key: uuid.parse(request.headers.get('Idempotency-Key')),
      p_body: input,
    });
    dbError(result.error);
    return result.data;
  });
}
