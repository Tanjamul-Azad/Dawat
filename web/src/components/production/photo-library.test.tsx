// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { PhotoLibrary } from './photo-library';
import { Login } from './login';
import { ProductLocale } from './product-locale';
import { errorText, latinDigits } from '@/features/production/copy';
const id = '11111111-1111-4111-8111-111111111111';
const result = (data: unknown) => new Response(JSON.stringify({ data }), { status: 200 });
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.cookie = 'dawat_ui=; Path=/; Max-Age=0';
  document.documentElement.lang = 'bn';
});
describe('Real photo transport and Bangla-first product flows', () => {
  it('shows an honest disabled-upload state while hosted media configuration is missing', async () => {
    const fetcher = vi.fn(() => Promise.resolve(result([])));
    vi.stubGlobal('fetch', fetcher);
    render(
      <PhotoLibrary
        wid={id}
        photos={[]}
        onChange={() => {}}
        onWorking={() => {}}
        disabled={false}
        available={false}
        locale="bn"
      />,
    );
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    expect((screen.getByLabelText('ছবি আপলোড') as HTMLInputElement).disabled).toBe(true);
    expect(screen.getByRole('status').textContent).toContain('ছবি আপলোড সেবা এখনও চালু হয়নি');
  });
  it('waits for processing acknowledgement before adding a photo to the draft', async () => {
    let complete!: (r: Response) => void;
    const pending = new Promise<Response>((r) => {
      complete = r;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn((_path, options) =>
        options?.method === 'POST'
          ? Promise.resolve(result({ id }))
          : options?.method === 'PUT'
            ? pending
            : Promise.resolve(result([])),
      ),
    );
    const change = vi.fn();
    const working = vi.fn();
    render(
      <PhotoLibrary
        wid={id}
        photos={[]}
        onChange={change}
        onWorking={working}
        disabled={false}
        locale="bn"
      />,
    );
    const field = screen.getByLabelText('ছবি আপলোড');
    await waitFor(() => expect((field as HTMLInputElement).disabled).toBe(false));
    fireEvent.change(field, {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    });
    await waitFor(() => expect(working).toHaveBeenCalledWith(true));
    expect(change).not.toHaveBeenCalled();
    await act(async () => {
      complete(result({ id, state: 'ready' }));
      await pending;
    });
    await waitFor(() =>
      expect(change).toHaveBeenCalledWith([{ id, src: `/media/${id}/960/`, alt: '', position: 'center' }]),
    );
  });
  it('retains the same reservation and file after an uncertain upload failure', async () => {
    const fetcher = vi.fn((_path, options) =>
      options?.method === 'POST'
        ? Promise.resolve(result({ id }))
        : options?.method === 'PUT'
          ? Promise.reject(new Error('Network interrupted'))
          : Promise.resolve(result([])),
    );
    vi.stubGlobal('fetch', fetcher);
    const change = vi.fn();
    render(
      <PhotoLibrary
        wid={id}
        photos={[]}
        onChange={change}
        onWorking={() => {}}
        disabled={false}
        locale="bn"
      />,
    );
    const field = screen.getByLabelText('ছবি আপলোড');
    await waitFor(() => expect((field as HTMLInputElement).disabled).toBe(false));
    const file = new File(['image'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(field, { target: { files: [file] } });
    fireEvent.click(await screen.findByRole('button', { name: 'একই ছবি আবার চেষ্টা করুন' }));
    await waitFor(() => expect(fetcher.mock.calls.filter((c) => c[1]?.method === 'PUT')).toHaveLength(2));
    expect(fetcher.mock.calls.filter((c) => c[1]?.method === 'POST')).toHaveLength(1);
    expect(change).not.toHaveBeenCalled();
    for (const call of fetcher.mock.calls.filter((c) => c[1]?.method === 'PUT'))
      expect(call[1].body).toBe(file);
  });
  it('does not add a photo after a malformed success acknowledgement', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((_path, options) =>
        options?.method === 'POST'
          ? Promise.resolve(result({ id }))
          : options?.method === 'PUT'
            ? Promise.resolve(new Response('<html>proxy error</html>'))
            : Promise.resolve(result([])),
      ),
    );
    const change = vi.fn();
    render(
      <PhotoLibrary
        wid={id}
        photos={[]}
        onChange={change}
        onWorking={() => {}}
        disabled={false}
        locale="bn"
      />,
    );
    const field = screen.getByLabelText('ছবি আপলোড');
    await waitFor(() => expect((field as HTMLInputElement).disabled).toBe(false));
    fireEvent.change(field, {
      target: { files: [new File(['image'], 'photo.jpg', { type: 'image/jpeg' })] },
    });
    await screen.findByRole('button', { name: 'একই ছবি আবার চেষ্টা করুন' });
    expect(change).not.toHaveBeenCalled();
  });
  it('does not allow a sixth selection and preserves the five chosen identities', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(result([]))),
    );
    const photos = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}1111111-1111-4111-8111-111111111111`,
      src: `/media/${i}/960/`,
      alt: `ছবি ${i}`,
    }));
    const change = vi.fn();
    render(
      <PhotoLibrary
        wid={id}
        photos={photos}
        onChange={change}
        onWorking={() => {}}
        disabled={false}
        locale="bn"
      />,
    );
    expect((screen.getByLabelText('ছবি আপলোড') as HTMLInputElement).disabled).toBe(true);
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(change).not.toHaveBeenCalled();
  });
  it('starts sign-in in Bengali and keeps a user-entered email when switching to English', () => {
    render(
      <ProductLocale>
        <Login next="/dashboard/" />
      </ProductLocale>,
    );
    expect(screen.getByRole('button', { name: 'ইমেইলে কোড পাঠান' })).toBeTruthy();
    fireEvent.change(screen.getByLabelText('ইমেইল ঠিকানা'), { target: { value: 'owner@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'English' }));
    expect((screen.getByLabelText('Email address') as HTMLInputElement).value).toBe('owner@example.test');
    expect(screen.getByRole('button', { name: 'Email me a code' })).toBeTruthy();
    expect(document.cookie).toContain('dawat_ui=en');
  });
  it('accepts Bengali OTP digits and localizes actionable photo errors', () => {
    expect(latinDigits('১২৩৪৫৬')).toBe('123456');
    expect(latinDigits('12৩4৫6')).toBe('123456');
    expect(errorText('Five photo slots are already occupied.')).toContain('পাঁচটি');
    expect(
      errorText('Remove this photo from the draft and save before removing it from your library.'),
    ).toContain('খসড়ার');
    expect(errorText('এই ছবিটি প্রস্তুত নেই।')).toBe('এই ছবিটি প্রস্তুত নেই।');
  });
});
