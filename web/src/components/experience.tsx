'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowUpRight, Menu, X, ArrowRight, RotateCcw } from 'lucide-react';
import { useWorkspace } from '@/features/workspace/use-workspace';
import { hasDashboardAccess } from '@/features/workspace/model';
import { AccessGate, OrderJourney } from './order-journey';
import { Wordmark, Modal } from './ui';
import { Home, Collection } from './home';
import { resolveLocale, type Locale } from '@/features/invitation/content';
const Studio = dynamic(() => import('./studio').then((module) => module.Studio));
const Dashboard = dynamic(() => import('./dashboard').then((module) => module.Dashboard));
const GuestInvitation = dynamic(() => import('./guest-invitation').then((module) => module.GuestInvitation));

export type View = 'home' | 'templates' | 'studio' | 'dashboard' | 'invite' | 'order' | 'operator';

export function Experience({ view }: { view: View }) {
  const store = useWorkspace();
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState('');
  const [aboutDemo, setAboutDemo] = useState(false);
  const [locale, setLocale] = useState<Locale>('bn');
  const publicPage = view === 'home' || view === 'templates';
  const t = (bn: string, en: string) => (publicPage && locale === 'bn' ? bn : en);
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem('dawat-product-language');
    } catch {
      /* Language preference is optional. */
    }
    setLocale(resolveLocale(new URLSearchParams(window.location.search).get('lang'), saved));
  }, []);
  function language(next: Locale) {
    setLocale(next);
    try {
      localStorage.setItem('dawat-product-language', next);
    } catch {
      /* Viewing does not require storage. */
    }
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(null, '', url);
  }
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 5500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const nav = [
    { href: '/templates/', title: t('আমাদের নকশা', 'The invitation'), id: 'templates' },
    { href: '/#how-it-works', title: t('যেভাবে কাজ করে', 'How it works'), id: 'story' },
    { href: '/order/', title: t('আপনার অর্ডার', 'Your order'), id: 'order' },
  ];
  return (
    <>
      {view !== 'invite' && (
        <>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <div className="demo-ribbon" lang={publicPage ? locale : 'en'}>
            <span>
              <i />
              {t(
                'নমুনা আয়োজন · ব্রাউজারেই সংরক্ষিত interactive preview',
                'Interactive design preview · fictional celebration · saved in this browser',
              )}
            </span>
            <button onClick={() => setAboutDemo(true)}>
              {t('নমুনা সম্পর্কে', 'About this preview')} <ArrowUpRight size={12} />
            </button>
          </div>
        </>
      )}
      {view !== 'invite' && (
        <header
          lang={publicPage ? locale : 'en'}
          className={`site-header ${view === 'studio' || view === 'dashboard' ? 'workspace-header' : ''}`}
        >
          <Wordmark />
          <nav
            id="site-navigation"
            aria-label="Main navigation"
            className={menu ? 'main-nav menu-open' : 'main-nav'}
          >
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenu(false)}
                aria-current={view === item.id ? 'page' : undefined}
              >
                {item.title}
              </a>
            ))}
          </nav>
          {publicPage && (
            <div
              className="product-languages"
              role="group"
              aria-label={locale === 'bn' ? 'ভাষা' : 'Language'}
            >
              {(['bn', 'en'] as const).map((lang) => (
                <button key={lang} lang={lang} onClick={() => language(lang)} aria-pressed={locale === lang}>
                  {lang === 'bn' ? 'বাংলা' : 'EN'}
                </button>
              ))}
            </div>
          )}
          <a href="/studio/" className="button button-small header-create">
            {t('নিজের মতো সাজান', 'Make it yours')} <ArrowUpRight size={16} />
          </a>
          <button
            className="mobile-menu icon-button"
            aria-label={menu ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menu}
            aria-controls="site-navigation"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </header>
      )}
      {store.storageError && view !== 'invite' && (
        <div className="storage-warning" role="alert">
          {store.storageError}
          <button onClick={store.reset}>Reset demo</button>
        </div>
      )}
      <main id="main" lang={publicPage ? locale : 'en'}>
        {view === 'home' && <Home invitation={store.workspace.draft} locale={locale} />}
        {view === 'templates' && <Collection invitation={store.workspace.draft} locale={locale} />}
        {['studio', 'dashboard', 'order', 'operator'].includes(view) && !store.ready && (
          <div className="invite-loading" role="status">
            Loading your saved demo…
          </div>
        )}
        {view === 'studio' && store.ready && <Studio {...store} notify={setNotice} />}
        {view === 'dashboard' &&
          store.ready &&
          (hasDashboardAccess(store.workspace) ? (
            <Dashboard {...store} notify={setNotice} />
          ) : (
            <AccessGate />
          ))}
        {(view === 'order' || view === 'operator') && store.ready && (
          <OrderJourney {...store} operator={view === 'operator'} notify={setNotice} />
        )}
        {view === 'invite' && <GuestInvitation {...store} notify={setNotice} />}
      </main>
      {(view === 'home' || view === 'templates') && (
        <footer className="site-footer" lang={locale}>
          <div>
            <Wordmark />
            <p>
              {t('আমাদের উৎসব, আমাদের মতো।', 'Made for the way we celebrate.')}
              <br />
              {t('শিকড়ের মায়া। ভালোবাসার আমন্ত্রণ।', 'Rooted in home. Shared with love.')}
            </p>
          </div>
          <div className="footer-note">
            <span>AN ORIGINAL DESIGN EXPLORATION</span>
            <p>Bangladesh, with love.</p>
            <small>Working brand · 2026 · No paid service is live.</small>
          </div>
          <a className="footer-cta" href="/studio/">
            {t('নিজের মতো সাজান', 'Make it yours')} <ArrowRight />
          </a>
        </footer>
      )}
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button aria-label="Dismiss message" onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}
      {aboutDemo && (
        <Modal title="A little note about this preview" onClose={() => setAboutDemo(false)}>
          <p>
            This is the first interactive design slice for Dawat, a working brand. The artwork and layouts are
            original. All names, venues and responses are fictional.
          </p>
          <p>
            Editor changes, personalized guests, RSVP and wishes are saved{' '}
            <strong>only in this browser</strong>. Links demonstrate the flow here; they are not a secure
            customer invitation service or cross-device response collection.
          </p>
          <p>
            Owner authentication, a shared database, verified payments and production delivery are not
            connected. No purchase or message is sent by this preview.
          </p>
          <p>
            To compare the complete journey, submit a sample order, then use the separate operator simulation
            to confirm and activate it. The browser gate is a UX demonstration, not authentication.
          </p>
          <a className="text-link" href="/operator/">
            Open operator simulation <ArrowUpRight size={15} />
          </a>
          <button
            className="button secondary"
            onClick={() => {
              store.reset();
              setAboutDemo(false);
              setNotice('The fictional demo has been reset.');
            }}
          >
            <RotateCcw size={16} /> Reset sample celebration
          </button>
        </Modal>
      )}
    </>
  );
}
