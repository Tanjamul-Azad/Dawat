'use client';
import { useProductLocale } from './product-locale';
import { createContext, useContext, useState, type ComponentProps } from 'react';
import Link from 'next/link';
import {
  ArrowUpRight,
  LayoutGrid,
  ShieldCheck,
  LogOut,
  Mail,
  NotebookPen,
  UsersRound,
  UserRound,
} from 'lucide-react';
import { api } from '@/features/production/client';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF } from '@/features/production/brand';
import { safeReturnPath } from '@/features/production/navigation';
import s from './workspace.module.css';
const NavigationGuard = createContext<{ pending: boolean; save: () => Promise<boolean> } | null>(null);
export function WorkspaceLink(props: ComponentProps<typeof Link>) {
  const guard = useContext(NavigationGuard);
  return (
    <Link
      {...props}
      prefetch={false}
      onNavigate={(event) => {
        if (!guard?.pending) return;
        event.preventDefault();
        void guard.save().then((saved) => {
          if (saved) window.location.assign(String(props.href));
        });
      }}
    />
  );
}
export function WorkspaceFrame({
  children,
  email,
  seller = false,
  wedding,
  onOverview,
  onEdit,
  navigationGuard,
}: {
  children: React.ReactNode;
  email?: string;
  seller?: boolean;
  wedding?: { id: string; title: string; view: 'overview' | 'editor' | 'guests' };
  onOverview?: () => void;
  onEdit?: () => void;
  navigationGuard?: { pending: boolean; save: () => Promise<boolean> };
}) {
  const { tr, locale, setLocale } = useProductLocale();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await api('/api/auth/logout/', { method: 'POST', body: {} });
      const next = safeReturnPath(window.location.pathname + window.location.search);
      window.location.assign(`/auth/login/?next=${encodeURIComponent(next)}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <NavigationGuard.Provider value={navigationGuard ?? null}>
      <div className={s.shell}>
        <a className="skip-link" href="#workspace-main">
          {tr('Skip to content')}
        </a>
        <header className={s.topbar}>
          <WorkspaceLink href="/dashboard/" className={s.brand}>
            {tr('dawat.')}
          </WorkspaceLink>
          <small>{seller ? tr('Seller workspace') : tr('Your wedding, thoughtfully arranged')}</small>
          <div className={s.account}>
            <button
              className={s.quiet}
              lang={locale === 'bn' ? 'en' : 'bn'}
              onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}
            >
              {locale === 'bn' ? 'English' : 'বাংলা'}
            </button>
            {email && (
              <details className={s.accountMenu}>
                <summary aria-label={locale === 'bn' ? 'আপনার অ্যাকাউন্ট' : 'Your account'}>
                  <UserRound size={17} />
                  <span>{email}</span>
                </summary>
                <div className={s.accountPopover}>
                  <strong>{locale === 'bn' ? 'প্রবেশ করা অ্যাকাউন্ট' : 'Signed-in account'}</strong>
                  <p>{email}</p>
                  <p>
                    {locale === 'bn'
                      ? 'অন্য ইমেইলে প্রবেশ করতে আগে বেরিয়ে যান।'
                      : 'Sign out before using a different email.'}
                  </p>
                  <WorkspaceLink className={s.quiet} href={seller ? '/admin/orders/' : '/dashboard/?all=1'}>
                    <LayoutGrid size={16} />
                    {seller ? tr('Orders & access') : tr('My weddings')}
                  </WorkspaceLink>
                  <a className={s.quiet} href={DAWAT_CONTACT_HREF}>
                    <Mail size={16} />
                    {locale === 'bn' ? 'সহায়তা ও যোগাযোগ' : 'Help & contact'}
                  </a>
                </div>
              </details>
            )}
            {email && (
              <button className={s.quiet} onClick={logout} disabled={busy}>
                <LogOut size={16} />
                {tr('Sign out')}
              </button>
            )}
          </div>
        </header>
        <div className={s.layout}>
          <nav
            className={`${s.sidebar} ${wedding ? s.weddingNavigation : ''}`}
            aria-label={tr('Workspace navigation')}
          >
            <p>{seller ? tr('Operations') : tr('Your workspace')}</p>
            <WorkspaceLink
              className={wedding ? s.secondaryNav : undefined}
              href={seller ? '/admin/orders/' : '/dashboard/?all=1'}
              aria-current={!wedding ? 'page' : undefined}
            >
              {seller ? <ShieldCheck size={18} /> : <LayoutGrid size={18} />}{' '}
              {seller ? tr('Orders & access') : tr('My weddings')}
            </WorkspaceLink>
            {wedding && (
              <>
                <p className={s.navWedding}>{wedding.title}</p>
                <WorkspaceLink
                  href={`/weddings/${wedding.id}/`}
                  onClick={
                    onOverview
                      ? (event) => {
                          event.preventDefault();
                          onOverview();
                        }
                      : undefined
                  }
                  aria-current={wedding.view === 'overview' ? 'page' : undefined}
                >
                  <LayoutGrid size={18} />
                  {locale === 'bn' ? 'সারসংক্ষেপ' : 'Overview'}
                </WorkspaceLink>
                <WorkspaceLink
                  href={`/weddings/${wedding.id}/?section=names`}
                  onClick={
                    onEdit
                      ? (event) => {
                          event.preventDefault();
                          onEdit();
                        }
                      : undefined
                  }
                  aria-current={wedding.view === 'editor' ? 'page' : undefined}
                >
                  <NotebookPen size={18} />
                  {locale === 'bn' ? 'আমন্ত্রণ সম্পাদনা' : 'Edit invitation'}
                </WorkspaceLink>
                <WorkspaceLink
                  href={`/weddings/${wedding.id}/guests/`}
                  aria-current={wedding.view === 'guests' ? 'page' : undefined}
                >
                  <UsersRound size={18} />
                  {locale === 'bn' ? 'অতিথি ও উত্তর' : 'Guests & replies'}
                </WorkspaceLink>
              </>
            )}
            <a
              className={wedding ? s.secondaryNav : undefined}
              href={DAWAT_CONTACT_HREF}
              title={DAWAT_CONTACT_EMAIL}
            >
              <Mail size={18} />
              {locale === 'bn' ? 'সহায়তা ও যোগাযোগ' : 'Help & contact'}
            </a>
            <p className={s.sideNote}>
              {seller
                ? tr('Payment, access and guest publication have independent controls.')
                : tr('A little organisation. More room for the celebration.')}
            </p>
          </nav>
          <main id="workspace-main" className={s.main}>
            {error && (
              <p className={s.error} role="alert">
                {error}
              </p>
            )}
            {children}
          </main>
        </div>
      </div>
    </NavigationGuard.Provider>
  );
}
export function SetupRequired() {
  const { tr } = useProductLocale();
  return (
    <WorkspaceFrame>
      <div className={s.intro}>
        <div>
          <p className={s.eyebrow}>{tr('Backend setup')}</p>
          <h1>{tr('A proper home for every wedding.')}</h1>
          <p>
            {tr(
              'Authentication and workspaces need the local Supabase stack. Sample invitations are available while the backend is being configured.',
            )}
          </p>
        </div>
      </div>
      <section className={s.panel}>
        <h2>{tr('Connect the local backend')}</h2>
        <p>
          {tr(
            'Follow the repository\u2019s local backend guide, start Supabase and add its URL and publishable key to the environment file. Restart the app when the configuration is ready.',
          )}
        </p>
        <p>
          {tr('Customer management becomes available only after verified sign-in and seller activation.')}
        </p>
        <a className={s.secondary} href="/invite/">
          {tr('Open sample invitation')}
          <ArrowUpRight size={16} />
        </a>
      </section>
    </WorkspaceFrame>
  );
}
