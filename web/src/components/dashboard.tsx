'use client';
import { useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  Download,
  Flower2,
  Heart,
  LayoutDashboard,
  List,
  Mail,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  attendance,
  csvCell,
  dateLabel,
  download,
  guestSchema,
  summarize,
  type Guest,
  type Workspace,
  type Attendance,
} from '@/features/workspace/model';
import { copyText, Modal } from './ui';

type Props = {
  workspace: Workspace;
  ready: boolean;
  update: (fn: (state: Workspace) => Workspace) => boolean;
  notify: (message: string) => void;
};
const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'guests', label: 'Guests & replies', icon: Users },
  { id: 'wishes', label: 'Private wishes', icon: Heart },
  { id: 'share', label: 'Share invitation', icon: Send },
];

export function Dashboard({ workspace, ready, update, notify }: Props) {
  const [tab, setTab] = useState('overview');
  const [event, setEvent] = useState('reception');
  const [filter, setFilter] = useState<Attendance | 'all'>('all');
  const [search, setSearch] = useState('');
  const [addGuest, setAddGuest] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [selected, setSelected] = useState<Guest | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const summary = summarize(workspace.guests, event);
  const visible = workspace.guests.filter(
    (g) =>
      g.events.includes(event as 'nikah' | 'reception') &&
      g.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (filter === 'all' || attendance(g, event) === filter),
  );
  const invitation = workspace.published ?? workspace.draft;
  async function copyGuest(id?: string) {
    if (!workspace.published) {
      notify('Finish and publish your invitation before sharing guest links.');
      return;
    }
    try {
      await copyText(
        `${window.location.origin}/invite/${id ? `?guest=${encodeURIComponent(id)}` : '?live=1'}`,
      );
      notify('Demo link copied. This preview uses data from this browser only.');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not copy the link.');
    }
  }
  function exportResponses() {
    const rows = [
      ['Guest / family', 'Event', 'Answer', 'Adults', 'Children', 'Total', 'Private note'],
      ...visible.map((guest) => {
        const answer = guest.responses[event];
        return [
          guest.name,
          event,
          attendance(guest, event),
          answer?.adults ?? '',
          answer?.children ?? '',
          answer ? answer.adults + answer.children : '',
          answer?.note ?? '',
        ];
      }),
    ];
    download(
      'dawat-demo-responses.csv',
      '\uFEFF' + rows.map((row) => row.map(csvCell).join(',')).join('\r\n'),
      'text/csv;charset=utf-8',
    );
    notify('The currently filtered fictional responses were exported.');
  }
  const title =
    tab === 'wishes'
      ? 'Words to keep forever.'
      : tab === 'share'
        ? 'A little joy, delivered.'
        : 'Your people. Your celebration.';
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-wedding">
          <span className="monogram-small">
            {invitation.partnerOne.slice(0, 1)}
            <i>&</i>
            {invitation.partnerTwo.slice(0, 1)}
          </span>
          <h3>
            {invitation.partnerOne} & {invitation.partnerTwo}
          </h3>
          <span>
            {dateLabel(invitation.events[1].date, { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <nav aria-label="Host workspace">
          {navigation.map((item) => (
            <button
              className={tab === item.id ? 'active' : ''}
              aria-current={tab === item.id ? 'page' : undefined}
              key={item.id}
              onClick={() => setTab(item.id)}
            >
              <item.icon size={17} />
              {item.label}
              {tab === item.id && <ChevronRight size={14} />}
            </button>
          ))}
          <a className="workspace-edit" href="/studio/">
            Edit invitation <ArrowUpRight size={15} />
          </a>
        </nav>
        <a className="sidebar-edit" href="/studio/">
          <Flower2 size={17} /> Back to your invitation <ArrowUpRight size={15} />
        </a>
        <div className="sidebar-bottom">
          <span>BROWSER SANDBOX</span>
          <p>
            A fictional celebration.
            <br />
            Saved only on this device.
          </p>
        </div>
      </aside>
      <div className="dashboard-main">
        <div className="workspace-breadcrumb">
          YOUR CELEBRATION <ChevronRight size={12} /> {navigation.find((n) => n.id === tab)?.label}
        </div>
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow">A PLACE FOR EVERY LITTLE DETAIL</span>
            <h1>{title}</h1>
            <p>
              {tab === 'wishes'
                ? 'Every warm wish, gathered in one quiet corner.'
                : tab === 'share'
                  ? 'One beautiful invitation. A personal welcome for each family.'
                  : 'Keep the details here. Keep your heart in the moment.'}
            </p>
          </div>
          <a
            className="button secondary button-small"
            href={workspace.published ? '/invite/?live=1' : '/studio/'}
          >
            {workspace.published ? 'View invitation' : 'Finish your invitation'} <ArrowUpRight size={16} />
          </a>
        </div>
        {!workspace.published && (
          <div className="preparing-notice">
            <Flower2 size={20} />
            <p>
              <strong>Your dashboard is ready. Your invitation is still preparing.</strong>
              <br />
              Review the design in your studio, then choose Update demo invitation. Guest links become
              shareable after publication.
            </p>
          </div>
        )}
        {(tab === 'overview' || tab === 'guests') && (
          <>
            <div className="dashboard-context">
              <label>
                <span>THE CELEBRATION</span>
                <select value={event} onChange={(e) => setEvent(e.target.value)}>
                  {invitation.events.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </label>
              <span>
                <i />
                {ready ? 'Fictional data · saved in this browser' : 'Loading saved demo…'}
              </span>
            </div>
            <div className="metric-grid">
              <div className="metric featured">
                <span>PEOPLE TO CELEBRATE WITH</span>
                <strong>
                  {summary.adults + summary.children}
                  <Flower2 size={42} strokeWidth={0.7} />
                </strong>
                <small>
                  {summary.adults} adults · {summary.children} children
                </small>
              </div>
              <div className="metric">
                <span>ACCEPTED INVITATIONS</span>
                <strong>
                  {summary.accepted}
                  <span className="metric-icon accepted">
                    <Check size={15} />
                  </span>
                </strong>
                <small>of {summary.invited} known guest groups</small>
              </div>
              <div className="metric">
                <span>UNABLE TO JOIN</span>
                <strong>
                  {summary.declined}
                  <span className="metric-icon declined">
                    <X size={14} />
                  </span>
                </strong>
                <small>Their kind words still count.</small>
              </div>
              <div className="metric">
                <span>YET TO HEAR FROM</span>
                <strong>
                  {summary.pending}
                  <span className="metric-icon pending">
                    <Mail size={15} />
                  </span>
                </strong>
                <small>Invited groups without a reply</small>
              </div>
            </div>
            <section className="responses-panel">
              <div className="responses-heading">
                <div>
                  <span className="eyebrow">EVERY YES, AND EVERY WARM WISH</span>
                  <h2>{tab === 'guests' ? 'Your guest list' : 'The replies'}</h2>
                </div>
                <button className="button button-small" onClick={() => setAddGuest(true)}>
                  <Plus size={16} /> Add a guest
                </button>
              </div>
              <div className="response-tools">
                <label className="search-field">
                  <Search size={16} />
                  <span className="sr-only">Search guests</span>
                  <input
                    placeholder="Find a guest or family…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className="response-filters" aria-label="Filter guest responses">
                  {(['all', 'accepted', 'declined', 'pending'] as const).map((value) => (
                    <button
                      key={value}
                      className={filter === value ? 'active' : ''}
                      onClick={() => setFilter(value)}
                    >
                      {value === 'pending' ? 'No reply' : value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
                <button className="export-button" onClick={exportResponses}>
                  <Download size={15} /> Export CSV
                </button>
              </div>
              <div className="response-table">
                <div className="response-table-head">
                  <span>GUEST / FAMILY</span>
                  <span>THE ANSWER</span>
                  <span>PEOPLE</span>
                  <span>INVITATION</span>
                  <span />
                </div>
                {visible.map((guest, index) => {
                  const answer = guest.responses[event];
                  const status = attendance(guest, event);
                  return (
                    <div className="response-row" key={guest.id}>
                      <button className="guest-name" onClick={() => setSelected(guest)}>
                        <span className={`guest-avatar avatar-${index % 4}`}>{guest.name.slice(0, 1)}</span>
                        <span>
                          {guest.name}
                          <small>{guest.events.length === 2 ? 'Nikah & reception' : guest.events[0]}</small>
                        </span>
                      </button>
                      <span className={`answer-badge ${status}`}>
                        {status === 'accepted' ? (
                          <Check size={12} />
                        ) : status === 'declined' ? (
                          <X size={12} />
                        ) : (
                          <i />
                        )}
                        {status === 'pending'
                          ? 'No reply yet'
                          : status === 'accepted'
                            ? 'Happily attending'
                            : 'Unable to join'}
                      </span>
                      <span className="people-count">
                        {answer ? answer.adults + answer.children : '—'}
                        <small>
                          {answer?.attendance === 'accepted'
                            ? `${answer.adults} adults · ${answer.children} children`
                            : answer?.attendance === 'declined'
                              ? 'With warm wishes'
                              : `Up to ${guest.allowance} invited`}
                        </small>
                      </span>
                      <button className="copy-guest" onClick={() => copyGuest(guest.id)}>
                        <Copy size={13} /> Copy link
                      </button>
                      <button
                        className="icon-button row-detail"
                        aria-label={`View ${guest.name}`}
                        onClick={() => setSelected(guest)}
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  );
                })}
                {visible.length === 0 && (
                  <div className="empty-state">
                    <Flower2 size={26} />
                    <h3>
                      {workspace.guests.length ? 'No guests in this view.' : 'Your guest list starts here.'}
                    </h3>
                    <p>
                      {workspace.guests.length
                        ? 'Try a different name or response filter.'
                        : 'Add your first family to create a personal welcome.'}
                    </p>
                    <button
                      onClick={() => {
                        setSearch('');
                        setFilter('all');
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
              <div className="response-table-footer">
                <span>
                  {visible.length} guest groups · {summary.invited} invited to this event
                </span>
                <span>Actual people and guest groups are counted separately.</span>
              </div>
            </section>
            <div className="dashboard-bottom-note">
              <Heart size={16} />
              <p>
                Every invitation can begin with their name. Add a family, choose their celebrations, and send
                a personal welcome.
              </p>
              <button onClick={() => setTab('share')}>
                Make it personal <ArrowRight size={14} />
              </button>
            </div>
          </>
        )}
        {tab === 'wishes' && (
          <section className="wishes-section">
            <div className="wishes-intro">
              <Heart size={26} strokeWidth={1} />
              <h2>A little collection of love.</h2>
              <p>Wishes are separate from RSVP. Sending a message never changes attendance.</p>
            </div>
            {workspace.wishes.map((wish) => (
              <article className="wish-card" key={wish.id}>
                <div>
                  <span>{wish.name}</span>
                  <small>{new Date(wish.createdAt).toLocaleDateString('en-GB')}</small>
                </div>
                <p lang="bn">{wish.body}</p>
                <button onClick={() => setRemoving(wish.id)}>
                  <Trash2 size={13} /> Remove wish
                </button>
              </article>
            ))}
            {workspace.wishes.length === 0 && (
              <div className="empty-state">
                <h3>A space for the lovely things to come.</h3>
                <p>Try sending a private wish from the guest invitation.</p>
                <a href="/invite/?live=1">
                  Open guest invitation <ArrowUpRight size={15} />
                </a>
              </div>
            )}
            <p className="feature-boundary">
              Photo wishes and a printable memory book are specified for a later implementation. This first
              preview collects text wishes.
            </p>
          </section>
        )}
        {tab === 'share' && (
          <section className="share-section">
            <article className="share-general">
              <div className="share-illustration">
                <span>
                  with love,
                  <br />
                  <i>
                    {invitation.partnerOne} & {invitation.partnerTwo}
                  </i>
                </span>
              </div>
              <div>
                <span className="eyebrow">ONE BEAUTIFUL INVITATION</span>
                <h2>Let the good news travel.</h2>
                <p>
                  Create a personal link for every guest or family. Their name, welcome and invited
                  celebrations are already included; guests never need to enter their own names. The general
                  link is a view-only preview and cannot collect replies.
                </p>
                <button className="button" onClick={() => copyGuest()}>
                  Copy general preview link <Copy size={16} />
                </button>
                <a className="text-link" href="/invite/?live=1">
                  Preview invitation <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
            <div className="share-personal">
              <div>
                <span className="eyebrow">A PERSONAL TOUCH</span>
                <h2>“This one is for you.”</h2>
                <p>
                  Add a guest or family, choose their celebrations, and write a little welcome just for them.
                </p>
              </div>
              <button className="button secondary" onClick={() => setAddGuest(true)}>
                <Plus size={16} /> Create personalized invitation
              </button>
            </div>
            <div className="share-boundary">
              <List size={20} />
              <p>
                <strong>A preview, not a delivery service.</strong> These links use this browser’s fictional
                workspace. Cross-device sharing, secure owner access and a shared response database require
                the production backend.
              </p>
            </div>
          </section>
        )}
      </div>
      {(addGuest || editingGuest) && (
        <AddGuest
          initialGuest={editingGuest ?? undefined}
          onClose={() => {
            setAddGuest(false);
            setEditingGuest(null);
          }}
          onAdd={(guest) => {
            const saved = update((current) => ({
              ...current,
              guests: editingGuest
                ? current.guests.map((item) =>
                    item.id === guest.id ? { ...guest, responses: item.responses } : item,
                  )
                : [...current.guests, guest],
            }));
            if (!saved) {
              notify('The guest could not be saved. Please check browser storage and retry.');
              return;
            }
            setAddGuest(false);
            setEditingGuest(null);
            notify(
              editingGuest
                ? 'Personal invitation updated. Their existing link stays the same.'
                : 'Personalized demo invitation created. Use Copy link or open the guest details to preview it.',
            );
          }}
        />
      )}
      {selected && (
        <Modal title={selected.name} onClose={() => setSelected(null)}>
          <span className="eyebrow">PERSONALIZED DEMO INVITATION</span>
          <p className="bangla-text">{selected.greeting}</p>
          {selected.message && <p>{selected.message}</p>}
          <dl className="guest-detail-list">
            <div>
              <dt>Celebrations</dt>
              <dd>{selected.events.join(' & ')}</dd>
            </div>
            <div>
              <dt>Party allowance</dt>
              <dd>Up to {selected.allowance} people per event</dd>
            </div>
            <div>
              <dt>Selected event</dt>
              <dd>{attendance(selected, event)}</dd>
            </div>
          </dl>
          {selected.responses[event]?.note && <blockquote>{selected.responses[event].note}</blockquote>}
          <div className="dialog-actions">
            <a
              className="button"
              href={`/invite/?guest=${encodeURIComponent(selected.id)}`}
              target="_blank"
              rel="noopener"
            >
              Preview their invitation <EyeIcon />
            </a>
            <button className="button secondary" onClick={() => copyGuest(selected.id)}>
              <Copy size={15} /> Copy link
            </button>
            <button
              className="button secondary"
              onClick={() => {
                setEditingGuest(selected);
                setSelected(null);
              }}
            >
              Edit personal invitation
            </button>
          </div>
          <p className="small-note">
            This is fictional browser-local data, not an authenticated customer record.
          </p>
        </Modal>
      )}
      {removing && (
        <Modal title="Remove this wish?" onClose={() => setRemoving(null)}>
          <p>
            The message will be removed from this browser’s demo. The guest’s attendance response will stay
            the same.
          </p>
          <div className="dialog-actions">
            <button className="button secondary" onClick={() => setRemoving(null)}>
              Keep the wish
            </button>
            <button
              className="button"
              onClick={() => {
                const saved = update((current) => ({
                  ...current,
                  wishes: current.wishes.filter((w) => w.id !== removing),
                }));
                if (!saved) {
                  notify('The wish has not been removed. Please check browser storage.');
                  return;
                }
                setRemoving(null);
                notify('Wish removed. Attendance has not changed.');
              }}
            >
              Remove wish
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EyeIcon() {
  return <ArrowUpRight size={15} />;
}

function AddGuest({
  onClose,
  onAdd,
  initialGuest,
}: {
  onClose: () => void;
  onAdd: (guest: Guest) => void;
  initialGuest?: Guest;
}) {
  const [error, setError] = useState('');
  function submit(form: FormData) {
    const name = String(form.get('name') ?? '').trim();
    const result = guestSchema.safeParse({
      id: initialGuest?.id ?? crypto.randomUUID(),
      name,
      nameBn: String(form.get('nameBn') ?? '').trim(),
      greeting: String(form.get('greeting') ?? '').trim(),
      greetingEn: String(form.get('greetingEn') ?? '').trim(),
      message: String(form.get('message') ?? '').trim(),
      messageEn: String(form.get('messageEn') ?? '').trim(),
      allowance: Number(form.get('allowance')),
      events: form.getAll('events'),
      responses: initialGuest?.responses ?? {},
    });
    if (!result.success) {
      setError('Add a name, at least one celebration and a party allowance between 1 and 20.');
      return;
    }
    if (
      Object.entries(result.data.responses).some(
        ([id, answer]) =>
          result.data.events.includes(id as 'nikah' | 'reception') &&
          answer.attendance === 'accepted' &&
          answer.adults + answer.children > result.data.allowance,
      )
    ) {
      setError(
        'The new limit is below their saved attendance. Keep a limit that includes the confirmed party.',
      );
      return;
    }
    onAdd(result.data);
  }
  return (
    <Modal title="A welcome, just for them." onClose={onClose}>
      <p>
        {initialGuest
          ? 'Update their welcome while keeping the same personal link and saved replies.'
          : 'Address the invitation to a person or family. Their name appears on the cover and reply; they will not be asked to type it.'}
      </p>
      <form action={submit} className="guest-form">
        <label>
          Guest or family name · English
          <input
            name="name"
            required
            maxLength={120}
            placeholder="Rahman Family"
            defaultValue={initialGuest?.name}
          />
        </label>
        <label>
          Guest or family name · বাংলা <span className="optional">optional</span>
          <input
            name="nameBn"
            maxLength={120}
            placeholder="রহমান পরিবার"
            defaultValue={initialGuest?.nameBn}
          />
          <small>If omitted, their original name is used in both languages.</small>
        </label>
        <label>
          Greeting · বাংলা <span className="optional">optional</span>
          <input
            name="greeting"
            maxLength={300}
            placeholder="প্রিয় রহমান পরিবার"
            defaultValue={initialGuest?.greeting}
          />
          <small>Leave blank for a greeting using their name.</small>
        </label>
        <label>
          Greeting · English <span className="optional">optional</span>
          <input
            name="greetingEn"
            maxLength={300}
            placeholder="Dear Rahman Family"
            defaultValue={initialGuest?.greetingEn}
          />
        </label>
        <label>
          A personal message · বাংলা <span className="optional">optional</span>
          <textarea
            name="message"
            rows={3}
            maxLength={500}
            placeholder="We would love to have you by our side."
            defaultValue={initialGuest?.message}
          />
          <small>Visible to anyone holding this demo invitation link.</small>
        </label>
        <label>
          A personal message · English <span className="optional">optional</span>
          <textarea name="messageEn" rows={3} maxLength={500} defaultValue={initialGuest?.messageEn} />
        </label>
        <div className="field-row">
          <label>
            Maximum people
            <input
              type="number"
              name="allowance"
              min={1}
              max={20}
              defaultValue={initialGuest?.allowance ?? 4}
              required
            />
          </label>
          <fieldset className="event-checkboxes">
            <legend>Invite them to</legend>
            <label>
              <input
                type="checkbox"
                name="events"
                value="nikah"
                defaultChecked={!initialGuest || initialGuest.events.includes('nikah')}
              />{' '}
              Nikah
            </label>
            <label>
              <input
                type="checkbox"
                name="events"
                value="reception"
                defaultChecked={!initialGuest || initialGuest.events.includes('reception')}
              />{' '}
              Reception
            </label>
          </fieldset>
        </div>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <button className="button" type="submit">
          {initialGuest ? 'Save personal invitation' : 'Create personal invitation'}{' '}
          <ArrowUpRight size={16} />
        </button>
      </form>
    </Modal>
  );
}
