'use client';
import type { Invitation, Workspace } from '@/features/workspace/model';
import { GuestInvitation } from '../guest-invitation';
import { renderPhotos } from '@/features/production/media';

export function InvitationPreview({
  content,
  scope,
  live = false,
  mediaBase,
}: {
  content: Invitation;
  scope: string;
  live?: boolean;
  mediaBase?: string;
}) {
  const rendered = mediaBase ? renderPhotos(content, mediaBase) : content;
  const workspace: Workspace = {
    version: 1,
    order: null,
    draft: rendered,
    published: rendered,
    guests: [],
    wishes: [],
  };
  return (
    <GuestInvitation
      workspace={workspace}
      ready
      update={() => false}
      notify={() => {}}
      authority={{ mode: live ? 'liveGeneral' : 'draftPreview', scope }}
    />
  );
}
