import { expect, it } from 'vitest';
import {
  appOrigin,
  bnDate,
  drawableText,
  invitationCard,
  invitationShare,
  templateSampleMetadata,
} from './share';
import { templates } from './catalog';

const content = {
  partnerOne: 'Mehrin',
  partnerTwo: 'Arif',
  hosts: 'Hosts',
  message: 'Message',
  theme: 'jamdani',
  photos: [],
  events: [
    { id: 'reception', title: 'Reception', date: '2027-02-14', time: '19:00', venue: 'Hall', address: '' },
    { id: 'nikah', title: 'Nikah', date: '2027-02-12', time: '16:00', venue: 'Home', address: '' },
  ],
};

it('APP_ORIGIN drives the absolute metadata base', () => {
  expect(appOrigin('https://dawat.example/ignored/path').href).toBe('https://dawat.example/');
  expect(appOrigin(undefined).origin).toBe('http://127.0.0.1:3000');
  expect(appOrigin('not a url').origin).toBe('http://127.0.0.1:3000');
});

it('uses each template’s own art for its sample preview and falls back to Jamdani', () => {
  for (const t of templates) {
    const meta = templateSampleMetadata(t.id);
    expect(meta.openGraph).toMatchObject({
      images: [{ url: `/og/${t.id}.jpg`, width: 1200, height: 630 }],
      url: `/invite/?template=${t.id}`,
      locale: 'bn_BD',
    });
    expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
  }
  expect(templateSampleMetadata('<script>').openGraph).toMatchObject({ url: '/invite/?template=jamdani' });
});

it('prefers Bengali names, picks the earliest published date and keeps Latin names off the image', () => {
  const latin = invitationShare(content)!;
  expect(latin).toEqual({
    names: 'Mehrin ও Arif',
    imageNames: '',
    date: bnDate('2027-02-12'),
    templateId: 'jamdani',
  });
  expect(invitationCard(latin).title).toBe('বিয়ের আমন্ত্রণ');
  const bangla = invitationShare({ ...content, partnerOneBn: 'মেহরিন', partnerTwoBn: 'আরিফ', templateId: 'rose' })!;
  expect(bangla.imageNames).toBe('মেহরিন ও আরিফ');
  expect(bangla.templateId).toBe('rose');
});

it('drops incomplete or unexpected content instead of previewing it', () => {
  expect(invitationShare({ ...content, partnerTwo: ' ' })).toBeNull();
  expect(invitationShare({ ...content, guestName: 'Rahman Family' })).toBeNull();
  expect(invitationShare(null)).toBeNull();
});

it('formats dates with Bengali digits and only glyphs the preview font has', () => {
  expect(bnDate('2027-02-14')).toMatch(/^১৪ \S+ ২০২৭$/);
  expect(drawableText(bnDate('2027-02-14'))).toBe(bnDate('2027-02-14'));
  expect(bnDate('2027-02-30')).toBe('');
  expect(drawableText('সাদামাটা, চিরসুন্দর <b>&')).toBe('সাদামাটা চিরসুন্দর');
});
