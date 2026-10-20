import type { Metadata } from 'next';
import { InvitationEntry } from '@/components/invitation-entry';

export const metadata: Metadata = {
  title: 'A wedding invitation, especially for you',
  description:
    'A personal invitation from the couple and their families. Open the invitation to discover their celebration.',
};

export default function Page() {
  return (
    <>
      <link rel="preload" as="image" href="/artwork/jamdani-vine-v5.webp" fetchPriority="high" />
      <InvitationEntry />
    </>
  );
}
