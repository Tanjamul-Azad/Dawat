'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, Menu, MessageCircle, X } from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import { whatsappLink, whatsappNumber } from '@/features/production/catalog';
import { DAWAT_CONTACT_EMAIL, DAWAT_CONTACT_HREF } from '@/features/production/brand';
import { socialLinks } from '@/features/production/brand';
import { BrandLockup, LotusMark } from './brand-mark';
import { MotionConfig } from 'motion/react';
import s from './storefront.module.css';

const phoneDisplay = `0${whatsappNumber.slice(3, 7)} ${whatsappNumber.slice(7)}`;

/** Keeps Tab inside the open sheet, closes on Esc and hands focus back to the menu button. */
function useSheet(open: boolean, close: () => void, opener: React.RefObject<HTMLButtonElement | null>) {
  const sheet = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const node = sheet.current;
    const trigger = opener.current;
    const focusable = () =>
      Array.from(node?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!node?.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      trigger?.focus();
    };
  }, [open, close, opener]);
  return sheet;
}

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { locale, setLocale } = useProductLocale();
  const pathname = usePathname() ?? '/';
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setMenu(false), []);
  const sheet = useSheet(menu, close, opener);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  const links: [string, string][] = [
    ['/templates/', t('নকশা', 'Designs')],
    ['/#how-it-works', t('কীভাবে কাজ করে', 'How it works')],
    ['/pricing/', t('দাম', 'Pricing')],
    ['/#faq', t('প্রশ্নোত্তর', 'FAQ')],
  ];
  const clear = overlay && !scrolled && !menu;
  return (
    <>
      <header className={s.header} data-clear={clear || undefined}>
        <div className={s.headerInner}>
          <a className={s.brand} href="/" aria-label={t('Dawat — প্রথম পাতা', 'Dawat — home')}>
            <BrandLockup locale={locale} size={34} wordClassName={s.brandWord} />
          </a>
          <nav className={s.nav} aria-label={t('মূল মেনু', 'Main navigation')}>
            {links.map(([href, label]) => (
              <a key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <div className={s.headerActions}>
            <button
              className={s.language}
              lang={locale === 'bn' ? 'en' : 'bn'}
              aria-label={t('Switch to English', 'বাংলায় দেখুন')}
              onClick={() => setLocale(locale === 'bn' ? 'en' : 'bn')}
            >
              {locale === 'bn' ? 'EN' : 'বাং'}
            </button>
            <a className={s.login} href="/dashboard/">
              {t('লগইন', 'Log in')}
            </a>
            <a className={s.headerCta} href="/templates/">
              {t('নকশা বেছে নিন', 'Choose a design')}
            </a>
            <button
              ref={opener}
              className={s.menu}
              aria-label={t('মেনু খুলুন', 'Open menu')}
              aria-expanded={menu}
              aria-haspopup="dialog"
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>
      {menu && (
        <div className={s.sheetLayer}>
          <button
            className={s.sheetBackdrop}
            tabIndex={-1}
            aria-label={t('মেনু বন্ধ করুন', 'Close menu')}
            onClick={close}
          />
          <div ref={sheet} className={s.sheet} role="dialog" aria-modal="true" aria-label={t('মেনু', 'Menu')}>
            <div className={s.sheetHead}>
              <span className={s.sheetGrab} aria-hidden="true" />
              <button className={s.sheetClose} aria-label={t('মেনু বন্ধ করুন', 'Close menu')} onClick={close}>
                <X size={22} />
              </button>
            </div>
            <nav aria-label={t('মূল মেনু', 'Main navigation')} onClick={close}>
              {links.map(([href, label]) => (
                <a key={href} href={href} aria-current={pathname === href ? 'page' : undefined}>
                  {label}
                </a>
              ))}
              <a href="/dashboard/">{t('লগইন', 'Log in')}</a>
            </nav>
            <div className={s.sheetActions}>
              <a
                className={s.secondary}
                href={whatsappLink()}
                target="_blank"
                rel="noreferrer"
                onClick={close}
              >
                <MessageCircle size={18} /> {t('WhatsApp-এ কথা বলুন', 'Chat on WhatsApp')}
              </a>
              <a className={s.primary} href="/templates/" onClick={close}>
                {t('নকশা বেছে নিন', 'Choose a design')} <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <footer className={s.footer}>
      <div className={s.footerInner}>
        <div className={s.footerBrand}>
          <a className={s.brand} href="/" aria-label={t('Dawat — প্রথম পাতা', 'Dawat — home')}>
            <LotusMark size={28} />
            <span className={s.brandWord}>Dawat.</span>
          </a>
          <p>
            {t(
              'বাংলার ঐতিহ্যে সাজানো ডিজিটাল বিয়ের আমন্ত্রণ।',
              'Digital wedding invitations, made the Bengali way.',
            )}
          </p>
          <a href={whatsappLink()} target="_blank" rel="noreferrer">
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp · {phoneDisplay}
          </a>
          <a href={DAWAT_CONTACT_HREF}>{DAWAT_CONTACT_EMAIL}</a>
          {socialLinks.facebook && (
            <a href={socialLinks.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          )}
        </div>
        <nav aria-label={t('নকশা', 'Designs')}>
          <strong>{t('নকশা', 'Designs')}</strong>
          <a href="/templates/">{t('সব নকশা', 'All designs')}</a>
          <a href="/pricing/">{t('দাম', 'Pricing')}</a>
        </nav>
        <nav aria-label={t('সাহায্য', 'Help')}>
          <strong>{t('সাহায্য', 'Help')}</strong>
          <a href="/#how-it-works">{t('কীভাবে কাজ করে', 'How it works')}</a>
          <a href="/#faq">{t('প্রশ্নোত্তর', 'FAQ')}</a>
          <a href="/contact/">{t('যোগাযোগ', 'Contact')}</a>
          <a href="/order/requests/">{t('আমার অর্ডার', 'My orders')}</a>
        </nav>
        <nav aria-label={t('নিয়ম', 'Policies')}>
          <strong>{t('নিয়ম', 'Policies')}</strong>
          <a href="/policies/#terms">{t('সেবার শর্ত', 'Terms of service')}</a>
          <a href="/policies/#privacy">{t('গোপনীয়তা', 'Privacy')}</a>
          <a href="/policies/#refund">{t('টাকা ফেরতের নিয়ম', 'Refunds')}</a>
        </nav>
      </div>
      <div className={s.footerPay}>
        <span className={s.bkash}>
          <i aria-hidden="true" />
          {t('bKash-এ পেমেন্ট', 'Pay with bKash')}
        </span>
        <span>
          {t('প্রতিটি পেমেন্ট মানুষ দিয়ে মিলিয়ে দেখা হয়।', 'Every payment is checked by a person.')}
        </span>
      </div>
      <div className={s.footerBottom}>
        <span>{t('বাংলাদেশে তৈরি', 'Made in Bangladesh')}</span>
        <span>© {new Date().getFullYear()} Dawat</span>
      </div>
    </footer>
  );
}

/** Round WhatsApp button. It steps aside while the visitor types so it never covers a field. */
function WhatsAppBubble() {
  const { locale } = useProductLocale();
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const on = (event: FocusEvent) =>
      setTyping(event.target instanceof HTMLElement && event.target.matches('input, textarea, select'));
    const off = () => setTyping(false);
    document.addEventListener('focusin', on);
    document.addEventListener('focusout', off);
    return () => {
      document.removeEventListener('focusin', on);
      document.removeEventListener('focusout', off);
    };
  }, []);
  return (
    <a
      className={s.whatsapp}
      data-hidden={typing || undefined}
      href={whatsappLink()}
      target="_blank"
      rel="noreferrer"
      aria-label={locale === 'bn' ? 'WhatsApp-এ যোগাযোগ করুন' : 'Contact us on WhatsApp'}
    >
      <MessageCircle size={24} strokeWidth={1.75} />
    </a>
  );
}

export function StorefrontFrame({ children, overlay = false }: { children: ReactNode; overlay?: boolean }) {
  const { locale } = useProductLocale();
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.22, ease: 'easeOut' }}>
      <div className={s.site} lang={locale}>
        <a className="skip-link" href="#public-main">
          {locale === 'bn' ? 'মূল অংশে যান' : 'Skip to content'}
        </a>
        <SiteHeader overlay={overlay} />
        <main id="public-main">{children}</main>
        <SiteFooter />
        <WhatsAppBubble />
      </div>
    </MotionConfig>
  );
}
