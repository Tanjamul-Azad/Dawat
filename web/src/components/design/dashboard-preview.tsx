'use client';

import { useState, type MouseEvent } from 'react';
import { Download, Heart, Link2 } from 'lucide-react';
import type { HouseholdRow, HouseholdReport } from '@/features/production/guests';
import type { Invitation } from '@/features/workspace/model';
import { WorkspaceFrame } from '../production/frame';
import { HostDashboardHeader, HostReportSummary } from '../production/host-dashboard-overview';
import { GuestList } from '../production/guest-list';
import { GuestListToolbar } from '../production/guest-list-toolbar';
import { useProductLocale } from '../production/product-locale';
import { Modal, copyText } from '../ui';
import w from '../production/workspace.module.css';
import s from './dashboard-preview.module.css';

const wid = '20000000-0000-4000-8000-000000000001';
const asOf = '2026-11-02T08:30:00+06:00';
const events: Invitation['events'] = [
  {
    id: 'nikah',
    title: 'The Nikah',
    titleBn: 'আকদ',
    date: '2026-12-11',
    time: '16:30',
    venue: 'The Garden Pavilion',
    venueBn: 'দ্য গার্ডেন প্যাভিলিয়ন',
    address: 'Gulshan, Dhaka',
    addressBn: 'গুলশান, ঢাকা',
  },
  {
    id: 'reception',
    title: 'The Reception',
    titleBn: 'বিবাহোত্তর সংবর্ধনা',
    date: '2026-12-12',
    time: '19:00',
    venue: 'The Grand Courtyard',
    venueBn: 'দ্য গ্র্যান্ড কোর্টইয়ার্ড',
    address: 'Banani, Dhaka',
    addressBn: 'বনানী, ঢাকা',
  },
];
const names = [
  'Sabbir & Family',
  'Nabila & Omar',
  'Tanvir & Family',
  'Megha Rahman',
  'Farhana & Family',
  'Afia & Family',
  'Imtiaz Ahmed',
  'Hasan & Family',
];
const namesBn = [
  'সাব্বির ও পরিবার',
  'নাবিলা ও ওমর',
  'তানভীর ও পরিবার',
  'মেঘা রহমান',
  'ফারহানা ও পরিবার',
  'আফিয়া ও পরিবার',
  'ইমতিয়াজ আহমেদ',
  'হাসান ও পরিবার',
];
const fixtureRows: HouseholdRow[] = names.map(
  (name, i): HouseholdRow => ({
    id: `20000000-0000-4000-8000-${String(i + 2).padStart(12, '0')}`,
    name,
    nameBn: namesBn[i],
    greeting: '',
    greetingEn: '',
    message: '',
    messageEn: '',
    privateNote: '',
    events: [
      { eventId: 'nikah', maxPeople: 4 },
      { eventId: 'reception', maxPeople: 4 },
    ],
    revision: 1,
    responseRevision: i < 4 ? 1 : 0,
    linkRevision: 1,
    linkState: i < 5 ? 'active' : 'missing',
    source: i === 7 ? 'open' : 'host',
    firstOpenedAt: i < 3 ? asOf : null,
    lastDelivery: i < 5 ? { channel: 'copy', at: asOf, linkRevision: 1 } : null,
    responses:
      i < 4
        ? {
            reception: {
              attendance: i === 3 ? 'declined' : 'accepted',
              adults: i === 3 ? 0 : 2,
              children: i === 0 || i === 2 ? 1 : 0,
              note: '',
              updatedAt: asOf,
            },
          }
        : {},
  }),
);

/** An isolated, labelled local review; production actions remain in GuestHub. No API calls. */
export function DashboardDesignPreview() {
  const { locale, tr } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const [rows, setRows] = useState(fixtureRows);
  const [couple, setCouple] = useState({
    partnerOne: 'Mehrin',
    partnerTwo: 'Arib',
    partnerOneBn: 'মেহরিন',
    partnerTwoBn: 'আরিব',
  });
  const coupleTitle =
    locale === 'bn'
      ? `${couple.partnerOneBn || couple.partnerOne} ও ${couple.partnerTwoBn || couple.partnerTwo}`
      : `${couple.partnerOne} & ${couple.partnerTwo}`;
  const [eventId, setEventId] = useState('reception');
  const [panel, setPanel] = useState<'guests' | 'wishes'>('guests');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [source, setSource] = useState('all');
  const [exportContacts, setExportContacts] = useState(false);
  const [dialog, setDialog] = useState('');
  const [notice, setNotice] = useState('');
  const [sharedOpen, setSharedOpen] = useState(false);
  const [editing, setEditing] = useState<HouseholdRow | null>(null);
  const count = (n: number) => new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD').format(n);
  const report: HouseholdReport = {
    rows,
    nextCursor: null,
    asOf,
    policyRevision: 1,
    policies: events.map((e) => ({ eventId: e.id, isOpen: true, deadline: null })),
    summary: {
      invited: rows.length,
      accepted: rows.filter((r) => r.responses[eventId]?.attendance === 'accepted').length,
      declined: rows.filter((r) => r.responses[eventId]?.attendance === 'declined').length,
      pending: rows.filter((r) => !r.responses[eventId]).length,
      adults: rows.reduce((n, r) => n + (r.responses[eventId]?.adults ?? 0), 0),
      children: rows.reduce((n, r) => n + (r.responses[eventId]?.children ?? 0), 0),
    },
  };
  const localized = rows.map((r) => ({ ...r, name: locale === 'bn' ? r.nameBn || r.name : r.name }));
  const visible = localized.filter(
    (r) =>
      r.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (status === 'all' || (r.responses[eventId]?.attendance ?? 'pending') === status) &&
      (source === 'all' || (r.source ?? 'host') === source),
  );
  const eventTitle = (id: string) => {
    const e = events.find((e) => e.id === id);
    return e ? (locale === 'bn' ? e.titleBn || e.title : e.title) : id;
  };
  const sampleLink = `/demo/?template=garden&lang=${locale}`;
  async function copy() {
    try {
      await copyText(new URL(sampleLink, location.origin).href);
      setNotice(t('নমুনা আমন্ত্রণের লিংক কপি হয়েছে।', 'Sample invitation link copied.'));
    } catch {
      setNotice(t('কপি করা যায়নি। নিচের লিংক খুলুন।', 'Could not copy. Open the sample link below.'));
    }
  }
  function localNavigation(e: MouseEvent<HTMLDivElement>) {
    const link = (e.target as Element).closest('a');
    const href = link?.getAttribute('href') ?? '';
    if (href === `/weddings/${wid}/` || href === `/weddings/${wid}/guests/`) return;
    if (href.startsWith(`/weddings/${wid}`) || href.startsWith('/dashboard')) {
      e.preventDefault();
      setDialog(href.includes('section=names') ? 'editor' : 'overview');
    }
  }
  return (
    <div onClickCapture={localNavigation}>
      <WorkspaceFrame
        wedding={{ id: wid, title: coupleTitle, view: 'guests' }}
        onOverview={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onGuests={() => {
          setPanel('guests');
          document.getElementById('host-guest-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      >
        <p className={s.previewNote}>
          {t(
            'ডিজাইন প্রিভিউ · সব নাম ও হিসাব নমুনা · কোনো আসল অতিথিকে মেসেজ যাবে না',
            'Design preview · fictional names and sample data · no messages are sent',
          )}
        </p>
        <HostDashboardHeader
          title={coupleTitle}
          event={events.find((e) => e.id === eventId)}
          editHref={`/weddings/${wid}/?section=names`}
          busy={false}
          disabled={false}
          onRefresh={() => setNotice(t('নমুনা রিপোর্ট দেখানো হচ্ছে।', 'Showing the sample report.'))}
          onBulk={() => setDialog('bulk')}
          onAdd={() => {
            setEditing(null);
            setDialog('add');
          }}
          onSend={() => setDialog('send')}
          onShared={() => setSharedOpen(true)}
        />
        {notice && (
          <p role="status" className={w.notice}>
            {notice}
          </p>
        )}
        <details
          id="shared-invitation-link"
          className={w.sharedInvitation}
          hidden={!sharedOpen}
          open={sharedOpen}
          onToggle={(e) => setSharedOpen(e.currentTarget.open)}
        >
          <summary>
            <Link2 size={18} />
            {t('সবার জন্য একটি লিংক', 'One link for everyone')}
          </summary>
          <div className={s.sharedBody}>
            <p>
              {t(
                'নিচের লিংকটি আমাদের নমুনা invitation খুলবে। কোনো গ্রাহকের ব্যক্তিগত লিংক নয়।',
                'This link opens the sample invitation. It is not a customer’s private link.',
              )}
            </p>
            <a href={sampleLink} target="_blank" rel="noreferrer">
              {t('নমুনা আমন্ত্রণ দেখুন', 'View sample invitation')}
            </a>
            <button className={w.secondary} onClick={() => void copy()}>
              {t('নমুনা লিংক কপি করুন', 'Copy sample link')}
            </button>
          </div>
        </details>
        <HostReportSummary
          data={report}
          events={events}
          eventId={eventId}
          reportEventId={eventId}
          filterLabel={tr('all')}
          busy={false}
          stale={false}
          onEventChange={setEventId}
          onReplySettings={() => setDialog('settings')}
        />
        <nav id="host-guest-list" className={w.steps} aria-label={tr('Guest management')}>
          <button aria-current={panel === 'guests' ? 'step' : undefined} onClick={() => setPanel('guests')}>
            {tr('Invitations & replies')}
          </button>
          <button aria-current={panel === 'wishes' ? 'step' : undefined} onClick={() => setPanel('wishes')}>
            {tr('Private wishes')}
          </button>
        </nav>
        {panel === 'guests' ? (
          <section className={`${w.panel} ${w.guestPanel}`}>
            <GuestListToolbar
              search={search}
              status={status}
              busy={false}
              shown={visible.length}
              includeHidden={false}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onApply={() => {}}
              onAdd={() => {
                setEditing(null);
                setDialog('add');
              }}
              exportAction={
                <button
                  className={w.secondary}
                  onClick={() => setDialog('export')}
                  aria-label={t('CSV নামান', 'Download CSV')}
                  title={t('CSV নামান', 'Download CSV')}
                >
                  <Download size={16} />
                  <span>{t('CSV নামান', 'Download CSV')}</span>
                </button>
              }
              options={
                <>
                  <label>
                    {t('আমন্ত্রণের উৎস', 'Invitation source')}
                    <select value={source} onChange={(e) => setSource(e.target.value)}>
                      <option value="all">{t('সব', 'All')}</option>
                      <option value="host">{t('নাম ধরে', 'Named')}</option>
                      <option value="open">{t('সবার লিংক থেকে', 'From shared link')}</option>
                    </select>
                  </label>
                  <label className={w.checkbox}>
                    <input
                      type="checkbox"
                      checked={exportContacts}
                      onChange={(e) => setExportContacts(e.target.checked)}
                    />
                    {t('CSV-তে WhatsApp নম্বরও রাখুন', 'Include WhatsApp numbers in CSV')}
                  </label>
                  <p>
                    {t(
                      'এখানে সব তথ্য নমুনা। CSV action-ও preview।',
                      'All data here is fictional. The CSV action is a preview too.',
                    )}
                  </p>
                </>
              }
              clearAction={
                (search || status !== 'all' || source !== 'all') && (
                  <button
                    type="button"
                    className={w.quiet}
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                      setSource('all');
                    }}
                  >
                    {t('বাছাই মুছুন', 'Clear filters')}
                  </button>
                )
              }
            />
            <GuestList
              rows={visible}
              eventId={eventId}
              busy={false}
              eventTitle={eventTitle}
              onSend={() => setDialog('send')}
              onCopy={() => void copy()}
              onPreview={() => setDialog('preview')}
              onEdit={(r) => {
                setEditing(r);
                setDialog('add');
              }}
              onCorrect={() => setDialog('correction')}
              onRotate={() => setDialog('link')}
              onRevoke={() => setDialog('link')}
            />
            {!visible.length && (
              <p className={w.empty}>{t('এই খোঁজে কোনো অতিথি নেই।', 'No guests match this search.')}</p>
            )}
            <p className={s.tableFoot}>
              {t('দেখানো হচ্ছে', 'Showing')} {count(visible.length)} / {count(rows.length)}{' '}
              {t('নমুনা আমন্ত্রণ', 'sample invitations')}
            </p>
          </section>
        ) : (
          <section className={w.panel}>
            <div className={w.sectionHeader}>
              <h2>{t('ভালোবাসার কিছু কথা', 'A little love, kept close')}</h2>
              <Heart size={22} />
            </div>
            {[0, 1].map((_, i) => (
              <article className={s.wish} key={i}>
                <span>{locale === 'bn' ? namesBn[i] : names[i]}</span>
                <small>{t('২ নভেম্বর, ২০২৬ · নমুনা', '2 November 2026 · sample')}</small>
                <p>
                  {i === 0
                    ? t(
                        'নতুন পথচলা সুন্দর হোক। তোমাদের দুজনের জন্য অনেক দোয়া ও ভালোবাসা।',
                        'Wishing you a beautiful new beginning, full of love and little everyday joys.',
                      )
                    : t(
                        'তোমাদের আনন্দের দিনে একসঙ্গে থাকতে মুখিয়ে আছি।',
                        'We cannot wait to share this lovely day with you both.',
                      )}
                </p>
              </article>
            ))}
          </section>
        )}
        {dialog && (
          <Modal
            title={
              dialog === 'editor'
                ? t('নাম বদলে দেখুন', 'Try different names')
                : dialog === 'add'
                  ? t('নমুনা অতিথি / দল', 'Sample guest / household')
                  : t('ডিজাইন প্রিভিউ', 'Design preview')
            }
            onClose={() => setDialog('')}
          >
            {dialog === 'editor' ? (
              <form
                className={w.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  setCouple({
                    partnerOne: String(data.get('partnerOne') ?? '').trim(),
                    partnerTwo: String(data.get('partnerTwo') ?? '').trim(),
                    partnerOneBn: String(data.get('partnerOneBn') ?? '').trim(),
                    partnerTwoBn: String(data.get('partnerTwoBn') ?? '').trim(),
                  });
                  setDialog('');
                  setNotice(
                    t(
                      'এই demo-র banner ও sidebar-এ নতুন নাম দেখানো হচ্ছে।',
                      'The banner and sidebar now show your preview names.',
                    ),
                  );
                }}
              >
                <p>
                  {t(
                    'এটি শুধু এই dashboard demo-তে বদলাবে। আসল editor-এ নাম draft থেকে আসে।',
                    'This changes the dashboard demo only. The actual editor uses the wedding draft.',
                  )}
                </p>
                <label>
                  {t('প্রথম নাম · English', 'First partner · English')}
                  <input name="partnerOne" required maxLength={120} defaultValue={couple.partnerOne} />
                </label>
                <label>
                  {t('দ্বিতীয় নাম · English', 'Second partner · English')}
                  <input name="partnerTwo" required maxLength={120} defaultValue={couple.partnerTwo} />
                </label>
                <label>
                  {t('প্রথম নাম · বাংলা', 'First partner · Bangla')}
                  <input name="partnerOneBn" maxLength={120} defaultValue={couple.partnerOneBn} />
                </label>
                <label>
                  {t('দ্বিতীয় নাম · বাংলা', 'Second partner · Bangla')}
                  <input name="partnerTwoBn" maxLength={120} defaultValue={couple.partnerTwoBn} />
                </label>
                <button className={w.button}>{t('নতুন নামে প্রিভিউ দেখুন', 'Apply names to preview')}</button>
              </form>
            ) : dialog === 'add' ? (
              <form
                className={w.form}
                onSubmit={(e) => {
                  e.preventDefault();
                  const data = new FormData(e.currentTarget);
                  const name = String(data.get('name') ?? '').trim();
                  if (!name) return;
                  setRows((current) =>
                    editing
                      ? current.map((r) =>
                          r.id === editing.id ? { ...r, name, nameBn: locale === 'bn' ? name : r.nameBn } : r,
                        )
                      : [
                          ...current,
                          {
                            ...fixtureRows[4],
                            id: crypto.randomUUID(),
                            name,
                            nameBn: locale === 'bn' ? name : '',
                            linkState: 'missing',
                            responses: {},
                            lastDelivery: null,
                            firstOpenedAt: null,
                          },
                        ],
                  );
                  setDialog('');
                  setNotice(
                    t(
                      'শুধু এই প্রিভিউতে নমুনা তালিকা বদলেছে।',
                      'Updated the sample list in this preview only.',
                    ),
                  );
                }}
              >
                <p>
                  {t(
                    'এখানে পরিবর্তন শুধু এই খোলা প্রিভিউতে থাকবে।',
                    'Changes here stay only in this open design preview.',
                  )}
                </p>
                <label>
                  {t('নাম', 'Name')}
                  <input name="name" maxLength={120} required defaultValue={editing?.name ?? ''} />
                </label>
                <button className={w.button}>{t('নমুনা তালিকায় রাখুন', 'Save in sample list')}</button>
              </form>
            ) : (
              <>
                <p>
                  {t(
                    'এই preview-এ আসল API, অতিথির তথ্য বা WhatsApp ব্যবহার করা হচ্ছে না। আপনার dashboard-এ এই কাজের বর্তমান ব্যবস্থা আগের মতোই থাকবে।',
                    'This preview uses no live API, guest data or WhatsApp delivery. The existing dashboard workflow remains connected in the actual application.',
                  )}
                </p>
                {dialog === 'send' && (
                  <ul>
                    {localized.slice(0, 3).map((r) => (
                      <li key={r.id}>{r.name}</li>
                    ))}
                  </ul>
                )}
                <a className={w.secondary} href={sampleLink} target="_blank" rel="noreferrer">
                  {t('নমুনা আমন্ত্রণ দেখুন', 'View sample invitation')}
                </a>
              </>
            )}
          </Modal>
        )}
      </WorkspaceFrame>
    </div>
  );
}
