'use client';
import { useState } from 'react';
import { Copy, LockKeyhole, UsersRound } from 'lucide-react';
import { copyText } from '../ui';
import { useProductLocale } from './product-locale';
import s from './workspace.module.css';

export function HandoffLinks({
  workspaceUrl,
  guestUrl,
  weddingId,
  live,
  paused = false,
}: {
  workspaceUrl: string;
  guestUrl?: string | null;
  weddingId: string;
  live: boolean;
  paused?: boolean;
}) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [notice, setNotice] = useState('');
  async function copy(url: string) {
    try {
      await copyText(url);
      setNotice(t('লিংক কপি হয়েছে। কোনো বার্তা পাঠানো হয়নি।', 'Link copied. No message has been sent.'));
    } catch {
      setNotice(
        t('কপি করা যায়নি। লিংকটি নির্বাচন করে নিজে কপি করুন।', 'Select the link and copy it manually.'),
      );
    }
  }
  return (
    <section className={s.panel} aria-label={t('কোন লিংক কাকে দেবেন', 'Which link to share')}>
      <h2>{t('কোন লিংক কাকে দেবেন', 'Which link to share')}</h2>
      <div className={s.handoffRow}>
        <LockKeyhole size={18} aria-hidden="true" />
        <div>
          <strong>{t('আপনার আয়োজনের পাতা', 'Your private workspace')}</strong>
          <p>
            {t(
              'শুধু আপনার জন্য। অতিথিদের পাঠাবেন না। খুলতে অর্ডারের ইমেইল দিয়ে লগইন করতে হবে।',
              'For you only. Do not send this to guests. Sign in with the assigned account to open it.',
            )}
          </p>
          <details className={s.optionalFields}>
            <summary>{t('আমার আয়োজনের লিংক রাখুন', 'Keep your wedding page link')}</summary>
            <label className={s.form}>
              {t('আমার আয়োজনের লিংক', 'Workspace link')}
              <input readOnly value={workspaceUrl} onFocus={(e) => e.target.select()} />
            </label>
            <button className={s.quiet} onClick={() => copy(workspaceUrl)}>
              <Copy size={14} />
              {t('নিজের লিংক কপি করুন', 'Copy workspace link')}
            </button>
          </details>
        </div>
      </div>
      <div className={s.handoffRow}>
        <UsersRound size={18} aria-hidden="true" />
        <div>
          <strong>{t('অতিথির আমন্ত্রণ', 'Guest invitations')}</strong>
          <p>
            {live
              ? t(
                  'অতিথি বা দল যোগ করে প্রত্যেকের ব্যক্তিগত লিংক দিন। সেই লিংকেই তাঁরা উত্তর ও শুভেচ্ছা জানাবেন।',
                  'Add guests or groups and share each personal link for replies and private wishes.',
                )
              : paused
                ? t(
                    'আমন্ত্রণ আবার চালু করলে আগের ব্যক্তিগত লিংকগুলো কাজ করবে। সংরক্ষিত উত্তর ও শুভেচ্ছা অক্ষত আছে।',
                    'Resume the invitation to use the existing personal links. Saved replies and wishes are retained.',
                  )
                : t(
                    'আগে আমন্ত্রণ অতিথিদের জন্য চালু করুন। তারপর অতিথি বা দল যোগ করে ব্যক্তিগত লিংক দিতে পারবেন।',
                    'Publish first, then add guests or groups and share personal links.',
                  )}
          </p>
          <a className={s.secondary} href={`/weddings/${weddingId}/guests/`}>
            {t('অতিথির লিংক পরিচালনা', 'Manage guest links')}
          </a>
          {live && guestUrl && (
            <details className={s.optionalFields}>
              <summary>
                {t(
                  'সবার জন্য লিংক (শুধু দেখা যাবে, উত্তর দেওয়া যাবে না)',
                  'Link for everyone (view only, no replies)',
                )}
              </summary>
              <p>
                {t(
                  'এই লিংকে উত্তর দেওয়া যায় না। নির্বাচিত সাধারণ অনুষ্ঠানের বিবরণ লিংকধারী সবাই দেখতে পারবেন।',
                  'Anyone with this link can view the selected general events. It cannot submit replies.',
                )}
              </p>
              <label className={s.form}>
                {t('সাধারণ আমন্ত্রণের লিংক', 'General invitation link')}
                <input readOnly value={guestUrl} onFocus={(e) => e.target.select()} />
              </label>
              <button className={s.quiet} onClick={() => copy(guestUrl)}>
                <Copy size={14} />
                {t('সবার জন্য লিংক কপি করুন', 'Copy link for everyone')}
              </button>
            </details>
          )}
        </div>
      </div>
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
