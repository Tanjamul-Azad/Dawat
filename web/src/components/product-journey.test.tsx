// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { createWorkspace } from '@/features/workspace/model';
import { Experience } from './experience';
import { Studio } from './studio';
import { Dashboard } from './dashboard';
import { GuestInvitation } from './guest-invitation';

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
  localStorage.clear();
  window.history.replaceState(null, '', '/?lang=en');
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('Figma presentation adoption preserves product behavior', () => {
  it('lets hosts address and edit a personal invitation without changing its link or saved replies', async () => {
    let workspace = createWorkspace();
    const update = (fn: (current: typeof workspace) => typeof workspace) => {
      workspace = fn(workspace);
      return true;
    };
    const { rerender } = render(<Dashboard workspace={workspace} ready update={update} notify={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add a guest' }));
    fireEvent.change(screen.getByLabelText('Guest or family name · English'), {
      target: { value: 'Mobile Cousins' },
    });
    fireEvent.change(screen.getByLabelText(/Guest or family name · বাংলা/), {
      target: { value: 'আমাদের কাজিনরা' },
    });
    fireEvent.change(screen.getByLabelText(/Greeting · English/), {
      target: { value: 'Our dearest cousins' },
    });
    fireEvent.change(screen.getByLabelText(/Greeting · বাংলা/), {
      target: { value: 'আমাদের অতি প্রিয় কাজিনরা' },
    });
    fireEvent.change(screen.getByLabelText(/A personal message · English/), {
      target: { value: 'Your place is already waiting.' },
    });
    fireEvent.click(screen.getByLabelText('Nikah'));
    fireEvent.submit(screen.getByRole('button', { name: 'Create personal invitation' }).closest('form')!);
    await waitFor(() => expect(workspace.guests.find((g) => g.name === 'Mobile Cousins')).toBeTruthy());
    const id = workspace.guests.at(-1)!.id;
    workspace.guests.at(-1)!.responses.reception = {
      attendance: 'accepted',
      adults: 2,
      children: 0,
      note: 'Keep this reply',
      updatedAt: '2026-10-19T12:00:00Z',
    };
    rerender(<Dashboard workspace={workspace} ready update={update} notify={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Mobile Cousins reception/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Edit personal invitation' }));
    fireEvent.change(screen.getByLabelText('Guest or family name · English'), {
      target: { value: 'Our Cousins' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Save personal invitation' }).closest('form')!);
    await waitFor(() => expect(workspace.guests.find((g) => g.id === id)!.name).toBe('Our Cousins'));
    const saved = workspace.guests.find((g) => g.id === id)!;
    expect(saved.events).toEqual(['reception']);
    expect(saved.nameBn).toBe('আমাদের কাজিনরা');
    expect(saved.responses.reception.note).toBe('Keep this reply');
    cleanup();
    window.history.replaceState(null, '', '/invite/?guest=' + encodeURIComponent(id) + '&lang=en');
    render(<GuestInvitation workspace={workspace} ready update={update} notify={() => {}} />);
    expect(screen.getByText('Our Cousins')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Open without animation' }));
    expect(screen.queryByRole('textbox', { name: 'Your name / family name' })).toBe(null);
    expect(screen.getByRole('heading', { name: 'The Reception' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'The Nikah' })).toBe(null);
    expect(screen.getByText('Received with love.')).toBeTruthy();
  });
  it('switches the public storefront and demo link language without changing customer data', () => {
    const customer = JSON.stringify(createWorkspace());
    localStorage.setItem('dawat-studio-sandbox-v1', customer);
    render(<Experience view="home" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('An invitation');
    fireEvent.click(screen.getByRole('button', { name: 'বাংলা' }));
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('দাওয়াত হোক');
    expect(screen.getByRole('link', { name: 'ডেমো খুলুন' }).getAttribute('href')).toBe('/invite/?lang=bn');
    expect(localStorage.getItem('dawat-studio-sandbox-v1')).toBe(customer);
    expect(localStorage.getItem('dawat-product-language')).toBe('bn');
    expect(window.location.search).toContain('lang=bn');
  });
  it('honors an explicit English URL even when language storage cannot be read', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    render(<Experience view="home" />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toContain('An invitation');
  });
  it('keeps storefront envelope peeking separate from invitation and order state', () => {
    const { container } = render(<Experience view="home" />);
    fireEvent.click(screen.getByRole('button', { name: /A little peek inside/ }));
    expect(container.querySelector('[data-open="true"]')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /Close the envelope/ }));
    expect(container.querySelector('[data-open="true"]')).toBe(null);
    expect(localStorage.getItem('dawat-studio-sandbox-v1')).toBe(null);
  });
  it('keeps unsaved maker inputs through the mobile preview and saves a draft without publishing it', async () => {
    let workspace = createWorkspace();
    const published = JSON.stringify(workspace.published);
    render(
      <Studio
        workspace={workspace}
        ready
        notify={() => {}}
        update={(transform) => {
          workspace = transform(workspace);
          return true;
        }}
      />,
    );
    const name = screen.getByLabelText('First partner’s name · English');
    fireEvent.change(name, { target: { value: 'Ayesha' } });
    fireEvent.click(screen.getByRole('button', { name: 'Preview invitation' }));
    expect(within(screen.getByRole('dialog')).getByText('Ayesha')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'বন্ধ করুন' }));
    expect((name as HTMLInputElement).value).toBe('Ayesha');
    fireEvent.click(screen.getByRole('button', { name: 'Save draft' }));
    await waitFor(() => expect(workspace.draft.partnerOne).toBe('Ayesha'));
    expect(JSON.stringify(workspace.published)).toBe(published);
    expect(workspace.order).toBe(null);
  });
  it('keeps dashboard totals derived from actual replies after tab and event changes', () => {
    const workspace = createWorkspace();
    workspace.guests = [
      {
        id: 'test-family',
        name: 'Test Family',
        greeting: '',
        message: '',
        allowance: 5,
        events: ['reception'],
        responses: {
          reception: {
            attendance: 'accepted',
            adults: 2,
            children: 1,
            note: '',
            updatedAt: new Date().toISOString(),
          },
        },
      },
    ];
    const { container } = render(
      <Dashboard workspace={workspace} ready update={() => true} notify={() => {}} />,
    );
    expect(container.querySelector('.metric.featured strong')?.textContent).toBe('3');
    fireEvent.click(screen.getByRole('button', { name: 'Guests & replies' }));
    expect(screen.getByRole('button', { name: 'Guests & replies' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByText('Test Family')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('THE CELEBRATION'), { target: { value: 'nikah' } });
    expect(container.querySelector('.metric.featured strong')?.textContent).toBe('0');
    expect(screen.queryByText('Test Family')).toBe(null);
  });
});
