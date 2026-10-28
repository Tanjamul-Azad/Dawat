'use client';
import { useState } from 'react';
import { createWorkspace } from '@/features/workspace/model';
import { findTemplate } from '@/features/production/catalog';
import { useProductLocale } from './product-locale';
import { GuestInvitation } from '../guest-invitation';
import type { ResponseTransport } from '../invitation-response';
export function DemoInvitation({ templateId }: { templateId?: string }) {
  const { locale, setLocale } = useProductLocale();
  const [workspace, setWorkspace] = useState(() => {
    const w = createWorkspace();
    const content = { ...w.published!, templateId: findTemplate(templateId).id };
    return { ...w, draft: content, published: content, guests: w.guests.map(g => ({ ...g, responses: {} })), wishes: [] };
  });
  const [notice, setNotice] = useState(false);
  const guest = workspace.guests[0];
  const remote: ResponseTransport = {
    demo: true,
    allowances: Object.fromEntries(guest.events.map(id => [id, guest.allowance])),
    policies: Object.fromEntries(guest.events.map(id => [id, { eventId: id, isOpen: true, deadline: null }])),
    refresh: async () => {},
    submitResponse: async (id, answer) => {
      setWorkspace(w => ({ ...w, guests: w.guests.map(g => g.id === guest.id ? { ...g, responses: { ...g.responses, [id]: { ...answer, updatedAt: new Date().toISOString() } } } : g) }));
      setNotice(true);
    },
    submitWish: async () => { setNotice(true); },
  };
  return <>
    {notice && <div role="status" style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', width: 'min(90%, 480px)', zIndex: 100, background: '#fff8eb', padding: 16, border: '1px solid #c6a471', borderRadius: 12 }}><p>{locale === 'bn' ? 'এটা নমুনা, উত্তর সংরক্ষণ হয়নি' : 'This is a sample; your reply was not saved.'}</p><button onClick={() => setNotice(false)}>{locale === 'bn' ? 'বন্ধ করুন' : 'Close'}</button></div>}
    <GuestInvitation workspace={workspace} ready update={() => false} notify={() => {}} authority={{ mode: 'liveHousehold', scope: 'public-demo', guestId: guest.id }} responseTransport={remote} onLocaleChange={setLocale} />
  </>;
}
