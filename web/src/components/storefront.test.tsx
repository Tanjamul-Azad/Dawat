// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SiteFooter, SiteHeader } from './storefront-chrome';
import { FAQ, FounderNote, PromiseBlock, Reviews } from './storefront-trust';
import { JourneyStrip, RsvpDemo } from './storefront-how';
import { Pricing } from './storefront';
import { StickyCta } from './storefront-chrome';
import { PoliciesPage } from './storefront-pages';
import { TemplateCard, TemplateCollection } from './storefront';
import { templates } from '@/features/production/catalog';
import { ProductLocale } from './production/product-locale';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));
vi.mock('./manual-payment', () => ({ ManualPayment: () => null }));

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const wrap = (node: React.ReactNode) => render(<ProductLocale>{node}</ProductLocale>);

it('opens the mobile menu as a dialog, keeps Tab inside it and closes on Escape', () => {
  wrap(<SiteHeader />);
  const opener = screen.getByRole('button', { name: 'মেনু খুলুন' });
  fireEvent.click(opener);
  const sheet = screen.getByRole('dialog', { name: 'মেনু' });
  const links = within(sheet).getAllByRole('link');
  expect(links.length).toBeGreaterThanOrEqual(5);
  expect(document.activeElement).toBe(within(sheet).getByRole('button', { name: 'মেনু বন্ধ করুন' }));
  (links[links.length - 1] as HTMLElement).focus();
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(sheet.contains(document.activeElement)).toBe(true);
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
});

it('has the four navigation links, a login link and the main call to action', () => {
  wrap(<SiteHeader />);
  const nav = screen.getByRole('navigation', { name: 'মূল মেনু' });
  expect(
    within(nav)
      .getAllByRole('link')
      .map((a) => a.textContent),
  ).toEqual(['নকশা', 'কীভাবে কাজ করে', 'দাম', 'প্রশ্নোত্তর']);
  expect(screen.getByRole('link', { name: 'লগইন' }).getAttribute('href')).toBe('/dashboard/');
  expect(screen.getByRole('link', { name: 'নকশা বেছে নিন' }).getAttribute('href')).toBe('/templates/');
});

it('shows the payment row and hides the social slot while no page exists', () => {
  wrap(<SiteFooter />);
  expect(screen.getByText('bKash-এ পেমেন্ট')).toBeTruthy();
  expect(screen.getByText('বাংলাদেশে তৈরি')).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Facebook' })).toBeNull();
});

it('hides the payment-review promise unless the owner set one', () => {
  const { unmount } = wrap(<PromiseBlock />);
  expect(screen.queryByText(/একই দিনে/)).toBeNull();
  unmount();
  wrap(<PromiseBlock paymentPromise={{ bn: 'সাধারণত একই দিনে যাচাই করি', en: '' }} />);
  expect(screen.getByText('সাধারণত একই দিনে যাচাই করি')).toBeTruthy();
});

it('renders no reviews or founder note until real data exists', () => {
  const { container } = wrap(
    <>
      <Reviews />
      <FounderNote />
    </>,
  );
  expect(container.textContent).toBe('');
  cleanup();
  const real = wrap(
    <Reviews
      items={[{ quote: { bn: 'খুব সুন্দর হয়েছে', en: 'Lovely' }, name: 'পরীক্ষা', permission: true }]}
    />,
  );
  expect(real.container.textContent).toContain('খুব সুন্দর হয়েছে');
});

it('explains both ways of sending from the host’s own WhatsApp, with no email promise, and the 30-day deletion in the FAQ', () => {
  wrap(<FAQ />);
  const text = document.body.textContent ?? '';
  expect(text).toContain('Send চাপবেন');
  expect(text).toContain('নাম ধরে আলাদা আমন্ত্রণ');
  expect(text).toContain('সবার জন্য একটি লিংক');
  expect(text).toContain('কতজন আসবেন');
  expect(text).not.toContain('নিজে থেকে চলে যায়');
  expect(text).toContain('আমরা WhatsApp-এ নিজে থেকে কিছু পাঠাই না');
  expect(text).toContain('৩০ দিন পরে');
});

it('shows a guest reply in the host list without saving anything', () => {
  const store = vi.spyOn(Storage.prototype, 'setItem');
  wrap(<RsvpDemo />);
  expect(screen.getByText('আসবেন ১ · আসবেন না ০ · উত্তর বাকি ২')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /আসব না/ }));
  expect(screen.getByText('আসবেন ১ · আসবেন না ১ · উত্তর বাকি ১')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'আবার চেষ্টা করুন' }));
  expect(screen.getByText('আসবেন ১ · আসবেন না ০ · উত্তর বাকি ২')).toBeTruthy();
  expect(store).not.toHaveBeenCalled();
});

it('puts typed names on every card and carries them to the order link', () => {
  wrap(<TemplateCollection full />);
  fireEvent.change(screen.getByLabelText('বরের নাম'), { target: { value: 'আরিব' } });
  fireEvent.change(screen.getByLabelText('কনের নাম'), { target: { value: 'মেহরিন' } });
  const cards = document.querySelectorAll('article');
  expect(cards).toHaveLength(templates.length);
  for (const card of cards) expect(card.textContent).toContain('আরিব');
  const choose = screen.getAllByRole('link', { name: /এটা বেছে নিন/ })[0];
  expect(decodeURIComponent(choose.getAttribute('href')!.split('names=')[1])).toBe('আরিব & মেহরিন');
});

it('names the packages Classic and Premium on cards and links the live sample', () => {
  wrap(<TemplateCard template={templates[0]} />);
  expect(screen.getByText(/ক্লাসিক/)).toBeTruthy();
  expect(screen.getAllByRole('link', { name: /লাইভ নমুনা/ })[1].getAttribute('href')).toBe(
    `/demo/?template=${templates[0].id}`,
  );
});

it('writes the policies in plain Bangla with the guest-contact deletion line', () => {
  wrap(<PoliciesPage />);
  const text = document.body.textContent ?? '';
  expect(text).toContain('৩০ দিন পরে এই ফোন নম্বর মুছে ফেলা হয়');
  expect(text).not.toMatch(/ইমেইল বা|MAIL_/);
  expect(text).toContain('ক্লাসিক ৳৫০০');
  expect(text).not.toMatch(/portal activation|republish|refund|retention|order\/audit|বিক্রেতা/);
});

it('marks only the middle package as recommended, without any sales claim', () => {
  wrap(<Pricing paymentDetails={false} />);
  const badges = screen.getAllByText('সবচেয়ে পছন্দের');
  expect(badges).toHaveLength(1);
  expect(badges[0].closest('article')?.textContent).toContain('প্রিমিয়াম');
  expect(document.body.textContent).not.toMatch(/[0-9০-৯]+ ?(গ্রাহক|customers)/);
});

it('shows the guest journey from the WhatsApp link to the host list', () => {
  wrap(<JourneyStrip />);
  expect(screen.getByText('এক নজরে দাওয়াত')).toBeTruthy();
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
    'WhatsApp-এ লিংক আসে',
    'কার্ড খুলে দেখেন',
    'উত্তর দেন',
    'আপনি তালিকায় দেখেন',
  ]);
});

it('keeps the sticky call to action hidden at the top of the page', () => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  const { container } = wrap(<StickyCta />);
  expect(container.querySelector('[data-show]')).toBeNull();
});
