'use client';
import { useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { InvitationEntry } from './invitation-entry';
import { useProductLocale } from './production/product-locale';
import { createWorkspace, workspaceSchema } from '@/features/workspace/model';
import type { TemplateId } from '@/features/production/catalog';
import x from './storefront-sections.module.css';

// The guest invitation keeps its sample replies under this key, in the visitor's own browser only.
const SAMPLE_KEY = 'dawat-guest-sample-v1';

/** Points the browser-only sample workspace at one design. Replies are kept when the design did not change. */
function seedSample(templateId: TemplateId) {
  try {
    const raw = localStorage.getItem(SAMPLE_KEY);
    if (raw) {
      const saved = workspaceSchema.parse(JSON.parse(raw));
      if (saved.published?.templateId === templateId) return;
    }
    const seed = createWorkspace();
    seed.draft = { ...seed.draft, templateId };
    seed.published = structuredClone(seed.draft);
    localStorage.setItem(SAMPLE_KEY, JSON.stringify(workspaceSchema.parse(seed)));
  } catch {
    /* Without storage the sample still opens; replies just are not remembered. */
  }
}

/** A full sample invitation with a working RSVP. Nothing is sent to any server. */
export function DemoInvitation({ templateId }: { templateId: TemplateId }) {
  const { locale } = useProductLocale();
  // Runs once on the first client render, before the invitation reads its sample. The server skips it.
  useState(() => {
    if (typeof window !== 'undefined') seedSample(templateId);
  });
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <>
      <div className={x.demoBar}>
        <a href="/templates/">
          <ArrowLeft size={16} aria-hidden="true" /> {t('সব নকশা', 'All designs')}
        </a>
        <span>{t('এটা নমুনা, উত্তর সংরক্ষণ হয়নি', 'This is a sample, replies are not saved')}</span>
        <a href={`/order/requests/?template=${templateId}`}>
          {t('এই নকশা বেছে নিন', 'Choose this design')} <ArrowRight size={16} aria-hidden="true" />
        </a>
      </div>
      <InvitationEntry />
    </>
  );
}
