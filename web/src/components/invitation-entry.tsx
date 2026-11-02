'use client';

import { useWorkspace } from '@/features/workspace/use-workspace';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { GuestInvitation } from './guest-invitation';
import s from './invitation-entry.module.css';
import type { TemplateId } from '@/features/production/catalog';

const PerformanceProbe = dynamic(() => import('./invitation-performance-probe'));

// Guest links do not need the storefront, order journey or editor bundles.
export function InvitationEntry({ sampleTemplateId }: { sampleTemplateId?: TemplateId } = {}) {
  const store = useWorkspace();
  const [performanceQa, setPerformanceQa] = useState(false);
  useEffect(() => {
    setPerformanceQa(new URLSearchParams(location.search).get('qa') === 'performance');
  }, []);
  return (
    <main id="main" className={s.root}>
      <GuestInvitation {...store} notify={() => {}} sampleTemplateId={sampleTemplateId} />
      {performanceQa && <PerformanceProbe />}
    </main>
  );
}
