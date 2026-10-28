'use client';
import { useProductLocale } from './product-locale';
import { useState } from 'react';
import { ArrowRight, RefreshCw, LockKeyhole, NotebookPen, UsersRound, Search } from 'lucide-react';
import type { WeddingSummary } from '@/features/production/contracts';
import { api } from '@/features/production/client';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF } from '@/features/production/brand';
import { WorkspaceFrame } from './frame';
import s from './workspace.module.css';
export function ClientDashboard({ initial, email }: { initial: WeddingSummary[]; email: string }) {
  const { tr, locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [weddings, setWeddings] = useState(initial);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const visible = weddings.filter((w) =>
    w.title.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  async function refresh() {
    setBusy(true);
    setError('');
    try {
      setWeddings(await api<WeddingSummary[]>('/api/weddings/'));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceFrame email={email}>
      <div className={s.intro}>
        <div>
          <p className={s.eyebrow}>{t('ড্যাশবোর্ড', 'Dashboard')}</p>
          <h1>{t('আপনার আয়োজন', 'Your celebrations')}</h1>
          <p>
            {t(
              'আমন্ত্রণ সাজান, অতিথিদের লিংক দিন, আর উত্তরগুলো এক জায়গায় দেখুন।',
              'Edit invitations, share personal links and keep every reply in one place.',
            )}
          </p>
        </div>
        <button className={s.secondary} onClick={refresh} disabled={busy}>
          <RefreshCw size={15} />
          {busy ? tr('Please wait…') : tr('Refresh access')}
        </button>
      </div>
      {error && (
        <p className={s.error} role="alert">
          {error}
          {tr('Previously loaded weddings are shown.')}
        </p>
      )}
      <div className={s.split}>
        <section className={s.panel}>
          <div className={s.sectionHeader}>
            <h2>{t('আমার আয়োজন', 'My weddings')}</h2>
            <span className={s.badge}>
              {new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(weddings.length)}
            </span>
          </div>
          {weddings.length > 3 && (
            <label className={s.dashboardSearch}>
              <Search size={16} />
              <input
                aria-label={t('আয়োজন খুঁজুন', 'Search weddings')}
                placeholder={t('আয়োজনের নাম লিখুন', 'Search by wedding name')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          )}
          {!weddings.length ? (
            <div className={s.empty}>
              <LockKeyhole size={28} />
              <h3>{tr('Your workspace is waiting.')}</h3>
              <p>
                {tr(
                  'Your email is verified. Ask your seller to confirm your order and activate this account. Refresh here after activation.',
                )}
              </p>
              <p className={s.accountHint}>
                {t('সহায়তা: ', 'Support: ')}
                <a href={DAWAT_CONTACT_HREF}>{DAWAT_CONTACT_EMAIL}</a>
              </p>
            </div>
          ) : (
            <ul className={s.list}>
              {visible.map((w) => (
                <li key={w.id} className={s.weddingCard}>
                  <div>
                    <strong>{w.title}</strong>
                    <small>
                      {w.state === 'active'
                        ? w.visibility === 'live'
                          ? tr('Published invitation')
                          : w.visibility === 'paused'
                            ? t('আমন্ত্রণ সাময়িক বন্ধ', 'Invitation paused')
                            : tr('Ready for your first draft')
                        : tr(w.state)}
                    </small>
                  </div>
                  {w.state === 'active' ? (
                    <div className={s.actions}>
                      <a className={s.button} href={`/weddings/${w.id}/`}>
                        <NotebookPen size={15} />
                        {t('আমন্ত্রণ এডিট করুন', 'Edit invitation')}
                        <ArrowRight size={14} />
                      </a>
                      <a className={s.secondary} href={`/weddings/${w.id}/guests/`}>
                        <UsersRound size={15} />
                        {t('অতিথি ও উত্তর', 'Guests & replies')}
                      </a>
                    </div>
                  ) : (
                    <span className={s.badge}>
                      <LockKeyhole size={13} />
                      {w.state === 'expired'
                        ? t('মেয়াদ শেষ · দাওয়াত টিমের সঙ্গে কথা বলুন', 'Expired · contact the Dawat team')
                        : tr(w.state)}
                    </span>
                  )}
                </li>
              ))}
              {!visible.length && (
                <li>
                  <p>{t('এই নামে কোনো আয়োজন পাওয়া যায়নি।', 'No weddings match that name.')}</p>
                </li>
              )}
            </ul>
          )}
        </section>
        <aside className={s.panel}>
          <NotebookPen size={22} />
          <h2 style={{ marginTop: 12 }}>{t('শুরু থেকে শেয়ার', 'From setup to sharing')}</h2>
          <ol className={s.checklist}>
            <li>{tr('01 \u00B7 Complete your names & wording')}</li>
            <li>{tr('02 \u00B7 Add the celebration details')}</li>
            <li>{tr('03 \u00B7 Preview, review & publish')}</li>
          </ol>
          <p>{tr('Your draft stays private until you publish.')}</p>
          <p>
            {t(
              'আপনার আয়োজনের পাতার লিংক গোপন রাখুন। অতিথিদের জন্য আলাদা আমন্ত্রণের লিংক বানাবেন।',
              'Keep your workspace link private. Create separate invitation links for guests.',
            )}
          </p>
        </aside>
      </div>
    </WorkspaceFrame>
  );
}
