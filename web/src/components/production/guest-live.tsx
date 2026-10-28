'use client';
import { useProductLocale } from './product-locale';
import { useEffect, useRef, useState } from 'react';
import type { GuestPayload } from '@/features/production/guests';
import { api, RequestError } from '@/features/production/client';
import type { Workspace, Guest } from '@/features/workspace/model';
import { GuestInvitation } from '../guest-invitation';
import type { ResponseTransport } from '../invitation-response';
import { renderPhotos } from '@/features/production/media';
export function GuestLive({
  initial,
  slug,
  preview = false,
  previewWeddingId,
}: {
  initial: GuestPayload;
  slug: string;
  preview?: boolean;
  previewWeddingId?: string;
}) {
  const { tr, setLocale } = useProductLocale();
  const [payload, setPayload] = useState(initial);
  const [unavailable, setUnavailable] = useState(false);
  const [stale, setStale] = useState(false);
  const pending = useRef<
    Record<
      string,
      {
        body: string;
        key: string;
      }
    >
  >({});
  const refreshing = useRef(false);
  const root = `/i/${slug}/h/${initial.guest.id}/api/`;
  async function refresh() {
    if (refreshing.current || preview) return;
    refreshing.current = true;
    try {
      const next = await api<GuestPayload>(root);
      setPayload((current) =>
        next.responseRevision < current.responseRevision ||
        next.householdRevision < current.householdRevision ||
        next.policyRevision < current.policyRevision
          ? current
          : next,
      );
      setStale(false);
    } catch (e) {
      if (e instanceof RequestError && e.status === 404) setUnavailable(true);
      else setStale(true);
      throw e;
    } finally {
      refreshing.current = false;
    }
  }
  useEffect(() => {
    if (preview) return;
    const check = () => {
      if (!document.hidden) void refresh().catch(() => {});
    };
    const interval = window.setInterval(check, 30000);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [preview, root]);
  async function send(kind: 'response' | 'wish', body: unknown) {
    const serialized = JSON.stringify(body);
    if (pending.current[kind]?.body !== serialized)
      pending.current[kind] = { body: serialized, key: crypto.randomUUID() };
    try {
      const result = await api<{
        responseRevision?: number;
        confirmedAt: string;
      }>(root, {
        method: 'POST',
        body,
        key: pending.current[kind].key,
      });
      if (
        !result ||
        !Number.isFinite(Date.parse(result.confirmedAt)) ||
        (kind === 'response' && (!Number.isInteger(result.responseRevision) || result.responseRevision! < 0))
      )
        throw new RequestError(502, 'INVALID_RESPONSE', tr('Could not complete this request. Please retry.'));
      delete pending.current[kind];
      return result;
    } catch (e) {
      if (e instanceof RequestError && e.status === 404) setUnavailable(true);
      throw e;
    }
  }
  const transport: ResponseTransport = {
    allowances: Object.fromEntries(payload.scopes.map((e) => [e.eventId, e.maxPeople])),
    policies: Object.fromEntries(payload.policies.map((p) => [p.eventId, p])),
    refresh,
    submitResponse: async (eventId, answer) => {
      const r = await send('response', {
        kind: 'response',
        expectedPolicyRevision: payload.policyRevision,
        expectedHouseholdRevision: payload.householdRevision,
        expectedResponseRevision: payload.responseRevision,
        answers: [
          {
            eventId,
            attendance: answer.attendance,
            adults: answer.adults,
            children: answer.children,
            note: answer.note,
          },
        ],
      });
      setPayload((p) =>
        r.responseRevision! < p.responseRevision
          ? p
          : {
              ...p,
              responseRevision: r.responseRevision!,
              guest: {
                ...p.guest,
                responses: { ...p.guest.responses, [eventId]: { ...answer, updatedAt: r.confirmedAt } },
              },
            },
      );
    },
    submitWish: async (body) => {
      await send('wish', { kind: 'wish', body });
    },
  };
  if (unavailable)
    return (
      <main style={{ maxWidth: 540, margin: '12vh auto', padding: 24 }}>
        <h1>{tr('This personal invitation is unavailable.')}</h1>
        <p>{tr('Please ask the hosts for their current personal link.')}</p>
      </main>
    );
  const guest: Guest = {
    ...payload.guest,
    events: payload.scopes.map((e) => e.eventId),
    allowance: Math.max(...payload.scopes.map((e) => e.maxPeople)),
  };
  const workspace: Workspace = {
    version: 1,
    order: null,
    draft: renderPhotos(
      payload.content,
      preview ? `/api/weddings/${previewWeddingId}/media` : `/i/${slug}/h/${guest.id}/media`,
    ),
    published: renderPhotos(
      payload.content,
      preview ? `/api/weddings/${previewWeddingId}/media` : `/i/${slug}/h/${guest.id}/media`,
    ),
    guests: [guest],
    wishes: [],
  };
  return (
    <>
      {stale && (
        <p role="status" style={{ padding: 12, textAlign: 'center' }}>
          {tr('Connection interrupted. Last loaded invitation shown; new replies need server confirmation.')}
        </p>
      )}
      <GuestInvitation
        workspace={workspace}
        ready
        update={() => false}
        notify={() => {}}
        authority={{
          mode: preview ? 'householdPreview' : 'liveHousehold',
          scope: `household-${guest.id}`,
          guestId: guest.id,
        }}
        hostWhatsapp={payload.hostWhatsapp}
        responseTransport={preview ? undefined : transport}
        onLocaleChange={setLocale}
      />
    </>
  );
}
export function GuestExchange({ slug }: { slug: string }) {
  const { tr } = useProductLocale();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(true);
  const started = useRef(false);
  async function exchange() {
    setBusy(true);
    setError('');
    try {
      const parts = window.location.pathname.split('/').filter(Boolean);
      const token = parts.at(-1);
      const r = await api<{
        path: string;
      }>('/api/guest/exchange/', {
        method: 'POST',
        body: { slug, token },
      });
      const lang = new URLSearchParams(window.location.search).get('lang');
      window.location.replace(r.path + (lang === 'en' ? '?lang=en' : lang === 'bn' ? '?lang=bn' : ''));
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void exchange();
  }, [slug]);
  return (
    <main style={{ maxWidth: 480, margin: '16vh auto', padding: 24, textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--display)', fontWeight: 400 }}>
        {tr('An invitation, especially for you.')}
      </h1>
      {busy ? (
        <p role="status">{tr('Preparing your invitation…')}</p>
      ) : (
        <>
          <p role="alert">{error}</p>
          <button className="button" onClick={exchange}>
            {tr('Try again')}
          </button>
          <p>{tr('Please use the current personal link from your hosts.')}</p>
        </>
      )}
    </main>
  );
}
