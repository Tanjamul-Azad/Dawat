'use client';
import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Heart } from 'lucide-react';
import { InvitationCover } from './artwork';
import { EnvelopeArtwork, Vine, WovenPattern } from './stationery-art';
import { formatDate, localNames, type Locale } from '@/features/invitation/content';
import { type Invitation } from '@/features/workspace/model';
import s from './home.module.css';

type Props = { invitation: Invitation; locale?: Locale };
export function Home({ invitation, locale = 'bn' }: Props) {
  const [peek, setPeek] = useState(false);
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const names = localNames(invitation, locale);
  return (
    <div className={s.page} lang={locale}>
      <section className={`${s.hero} ${s.wrap}`}>
        <div>
          <p className={s.eyebrow}>
            {t('বাংলাদেশের উৎসব, পৃথিবীর যেখানেই থাকুন', 'FOR THE WAY WE CELEBRATE, WHEREVER WE CALL HOME')}
          </p>
          <h1>{t('দাওয়াত হোক আপনাদের গল্পের মতো।', 'An invitation that feels like your celebration.')}</h1>
          <p className={s.heroTranslation} lang={locale === 'bn' ? 'en' : 'bn'}>
            {t('A little paper magic. A very personal welcome.', 'কাগজের মায়া, ভালোবাসার আমন্ত্রণ।')}
          </p>
          <p className={s.intro}>
            {t(
              'জামদানির নকশা, যত্নে সাজানো নাম আর প্রতিটি পরিবারের জন্য নিজের মতো সম্বোধন। একটি সুন্দর লিংকে আপনার আনন্দের সব আয়োজন।',
              'Woven details, carefully set names, and a welcome for every family. Your whole celebration, held in one beautiful link.',
            )}
          </p>
          <div className={s.actions}>
            <a className="button" href="/templates/">
              {t('আমন্ত্রণটি দেখুন', 'Explore the invitation')}
              <ArrowUpRight size={17} />
            </a>
            <a className="button secondary" href={`/invite/?lang=${locale}`}>
              {t('ডেমো খুলুন', 'Open the full demo')}
              <ArrowRight size={17} />
            </a>
          </div>
          <p className={s.smallNote}>
            {t(
              'বাংলা ও English · ফোনের জন্য তৈরি · নিজস্ব পারিবারিক লিংক',
              'Bangla & English · Made for phones · Personal family links',
            )}
          </p>
        </div>
        <div className={s.heroScene}>
          <WovenPattern />
          <span className={s.sceneLabel}>{t('প্রথম সংস্করণ / ০১', 'THE FIRST EDITION / 01')}</span>
          <div className={s.envelopeWrap}>
            <EnvelopeArtwork
              names={names.join(locale === 'bn' ? ' ও ' : ' & ')}
              date={formatDate(invitation.events[1].date, locale)}
              opened={peek}
            />
          </div>
          <button className={s.peek} onClick={() => setPeek(!peek)} aria-pressed={peek}>
            {peek
              ? t('খামটি বন্ধ করুন', 'Close the envelope')
              : t('একটু ভেতরে দেখুন', 'A little peek inside')}{' '}
            <span aria-hidden="true">↗</span>
          </button>
          <span className={s.sceneFoot}>JAMDANI IVORY · DAWAT STUDIO</span>
        </div>
      </section>
      <div className={s.heritage}>
        <span>{t('হলুদের হাসি', 'The holud laughter')}</span>
        <i>✧</i>
        <span>{t('নিকাহের মায়া', 'The quiet nikah')}</span>
        <i>✧</i>
        <span>{t('বিয়ের আনন্দ', 'The big, beautiful biye')}</span>
      </div>
      <Collection invitation={invitation} locale={locale} embedded />
      <section className={`${s.process} ${s.wrap}`} id="how-it-works">
        <header>
          <p className={s.eyebrow}>{t('আপনার মন থেকে, তাঁদের ফোনে', 'FROM YOUR HEART, TO THEIR PHONE')}</p>
          <h2>{t('সুন্দর শুরু। সহজ পথচলা।', 'A thoughtful beginning. An effortless journey.')}</h2>
        </header>
        <ol className={s.steps}>
          {[
            [
              t('অনুভূতিটা বেছে নিন', 'Find your feeling'),
              t(
                'পুরো আমন্ত্রণটি খুলে দেখুন। ছবি, অনুষ্ঠান আর উত্তর দেওয়ার অভিজ্ঞতা চেষ্টা করুন।',
                'Open the complete invitation. Explore its photographs, celebrations and guest reply experience.',
              ),
            ],
            [
              t('নিজের মতো সাজান', 'Make it personal'),
              t(
                'নাম, তারিখ আর নিজের কথা দিয়ে preview সাজিয়ে অর্ডার রিভিউ করুন।',
                'Try your names, dates and words in a bounded preview, then review your order.',
              ),
            ],
            [
              t('আপনার আয়োজন প্রস্তুত', 'Your space, made ready'),
              t(
                'অর্ডার নিশ্চিত ও access সক্রিয় হলে আপনার dedicated dashboard পাবেন।',
                'After order confirmation and separate activation, receive your dedicated dashboard entry.',
              ),
            ],
            [
              t('ভালোবাসা পৌঁছে দিন', 'Send a little joy'),
              t(
                'আমন্ত্রণ প্রকাশ করুন, পরিবারের লিংক পাঠান আর অতিথিদের উত্তর এক জায়গায় দেখুন।',
                'Publish, share personal family links, and keep every reply together.',
              ),
            ],
          ].map(([title, body], index) => (
            <li key={title}>
              <span>
                {(index + 1).toLocaleString(locale === 'bn' ? 'bn-BD' : 'en-GB', { minimumIntegerDigits: 2 })}
              </span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className={s.familySection} id="story">
        <div className={`${s.wrap} ${s.split}`}>
          <div>
            <p className={s.eyebrow}>
              {t('একটি কার্ড। অনেক আপনজন।', 'ONE INVITATION. SO MANY PEOPLE TO LOVE.')}
            </p>
            <h2>
              {t('প্রতিটি পরিবারের জন্য একটু আলাদা ভালোবাসা।', 'A personal welcome, for every family.')}
            </h2>
            <p className={s.intro}>
              {t(
                'আলাদা artwork বানাতে হবে না। একই সুন্দর কার্ডে বদলাবে নাম, শুভেচ্ছা, অনুষ্ঠানের অনুমতি আর অতিথির সংখ্যা।',
                'One considered design, with each family’s name, greeting, permitted celebrations and invitation allowance.',
              )}
            </p>
            <a className={s.textLink} href="/studio/">
              {t('নিজের নামে সাজিয়ে দেখুন', 'Try your own names')}
              <ArrowRight size={17} />
            </a>
          </div>
          <div className={s.familyLetter}>
            <span className={s.eyebrow}>
              {t('একটি ব্যক্তিগত আমন্ত্রণের নমুনা', 'A FICTIONAL FAMILY INVITATION')}
            </span>
            <h3>{t('প্রিয় রহমান পরিবার,', 'Dear Rahman Family,')}</h3>
            <Vine />
            <p>
              {t(
                'আমাদের নতুন শুরুর আনন্দে আপনাদের পাশে চাই।',
                'Our new beginning would mean so much more with you beside us.',
              )}
            </p>
            <dl>
              <div>
                <dt>{t('যে অনুষ্ঠানে আমন্ত্রণ', 'Your celebration')}</dt>
                <dd>{t('বিবাহোত্তর সংবর্ধনা', 'The reception')}</dd>
              </div>
              <div>
                <dt>{t('আপনাদের জন্য', 'A place for')}</dt>
                <dd>{t('সর্বোচ্চ ৫ জন', 'Up to 5 people')}</dd>
              </div>
            </dl>
            <span className={s.letterFoot}>
              <Check size={15} />
              {t('সবার উত্তর। এক জায়গায়।', 'Every reply, in its own place.')}
            </span>
          </div>
        </div>
      </section>
      <section className={`${s.wrap} ${s.faqSection}`}>
        <header>
          <p className={s.eyebrow}>{t('ছোট ছোট প্রশ্ন', 'A FEW THINGS YOU MIGHT WONDER')}</p>
          <h2>{t('আয়োজনের আগে।', 'Before the celebrations.')}</h2>
        </header>
        <div className={s.faq}>
          {[
            [
              t('দম্পতির ছবি কি লাগবেই?', 'Do we need couple photographs?'),
              t(
                'না। ছবি ছাড়াও সম্পূর্ণ একটি নকশা আছে। চাইলে নিজের ছবি ও ব্যক্তিগত গল্প যোগ করতে পারবেন।',
                'No. The photo-free edition is a complete composition. Add photographs if they help tell your story.',
              ),
            ],
            [
              t('Dashboard কখন পাব?', 'When do we receive our dashboard?'),
              t(
                'অর্ডার নিশ্চিত হওয়ার পর আলাদাভাবে access সক্রিয় করে আপনার dedicated dashboard entry দেওয়া হবে।',
                'After the order is confirmed and your access is separately activated, you receive your dedicated dashboard entry.',
              ),
            ],
            [
              t('প্রতিটি পরিবারের আলাদা কার্ড লাগবে?', 'Does every family need a new card?'),
              t(
                'একটি মূল নকশা থেকেই ব্যক্তিগত সম্বোধন ও অনুষ্ঠানের অনুমতিসহ পরিবারের লিংক তৈরি হবে।',
                'One base design powers personal family links, with their greeting and permitted celebrations.',
              ),
            ],
            [
              t('প্যাকেজের মূল্য কত?', 'How much does it cost?'),
              t(
                'চূড়ান্ত মূল্য ও hosting-এর মেয়াদ এখনও নির্ধারিত হয়নি। এটি একটি interactive design preview; এখানে বাস্তব পেমেন্ট হয় না।',
                'Final pricing and hosting terms are still being decided. This is an interactive design preview; no payment is collected.',
              ),
            ],
          ].map(([question, answer]) => (
            <details key={question}>
              <summary>
                {question}
                <span aria-hidden="true">+</span>
              </summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>
      <section className={s.closing}>
        <WovenPattern />
        <div>
          <Heart size={24} strokeWidth={1} />
          <p className={s.eyebrow}>{t('আপনার আনন্দের প্রথম চিঠি', 'THE FIRST LETTER OF YOUR CELEBRATION')}</p>
          <h2>{t('শুরু হোক ভালোবাসায়।', 'Let’s make it an occasion.')}</h2>
          <a className="button" href="/studio/">
            {t('আমন্ত্রণ সাজানো শুরু করুন', 'Begin your invitation')}
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
    </div>
  );
}

export function Collection({ invitation, embedded = false, locale = 'bn' }: Props & { embedded?: boolean }) {
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  return (
    <section className={s.collection} data-embedded={embedded} id="collection" lang={locale}>
      {embedded && <WovenPattern />}
      <div className={s.wrap}>
        {!embedded && (
          <header className={s.collectionHeading}>
            <p className={s.eyebrow}>{t('আমাদের প্রথম নকশা', 'OUR FIRST ORIGINAL COMPOSITION')}</p>
            <h1>{t('জামদানি আইভরি।', 'Jamdani Ivory.')}</h1>
            <p>
              {t(
                'নকশায় শিকড়ের মায়া। অভিজ্ঞতায় নতুনের ছোঁয়া।',
                'Rooted in home. Made for the way you celebrate.',
              )}
            </p>
          </header>
        )}
        <div className={s.edition}>
          <a
            className={s.cardStage}
            href={`/invite/?lang=${locale}`}
            aria-label={t('জামদানি আইভরির পুরো ডেমো খুলুন', 'Open the full Jamdani Ivory demo')}
          >
            <span className={s.eyebrow}>
              {t('কাগজ, নকশা আর একটু মায়া', 'PAPER, PATTERN & A LITTLE NOSTALGIA')}
            </span>
            <div className={s.cover}>
              <InvitationCover invitation={invitation} locale={locale} compact />
            </div>
            <span className={s.cardLink}>
              {t('পুরো আমন্ত্রণটি খুলুন', 'OPEN THE FULL INVITATION')}
              <ArrowUpRight size={16} />
            </span>
          </a>
          <div className={s.editionCopy}>
            <p className={s.eyebrow}>JAMDANI IVORY · 01</p>
            <h2>{t('ঐতিহ্যের বুননে, আপনাদের গল্প।', 'Woven in tradition. Made for your story.')}</h2>
            <p>
              {t(
                'আইভরি কাগজ, গাঢ় wine কালি আর যত্নের নকশা। প্রথম খাম খোলা থেকে শেষ শুভেচ্ছা—একটি সম্পূর্ণ অভিজ্ঞতা।',
                'Layered ivory paper. Deep wine ink. Woven details. From the first opening to the last warm wish, one complete experience.',
              )}
            </p>
            <dl className={s.inclusions}>
              {[
                [t('ভাষা', 'Languages'), 'বাংলা + English'],
                [t('অনুষ্ঠান', 'Celebrations'), t('নিকাহ ও বিবাহোত্তর সংবর্ধনা', 'Nikah & reception')],
                [
                  t('ব্যক্তিগত ছোঁয়া', 'Personal touches'),
                  t('নিজস্ব নাম, ছবি, পারিবারিক লিংক', 'Your names, photographs & family links'),
                ],
                [
                  t('অতিথির অভিজ্ঞতা', 'For your guests'),
                  t('Maps, calendar, RSVP ও শুভেচ্ছা', 'Maps, calendar, RSVP & private wishes'),
                ],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className={s.actions}>
              <a className={`button ${embedded ? s.lightButton : ''}`} href="/studio/?theme=jamdani">
                {t('নিজের মতো সাজান', 'Make it yours')}
                <ArrowUpRight size={17} />
              </a>
              <a className={s.textLink} href={`/invite/?lang=${locale}`}>
                {t('ডেমো দেখুন', 'Experience the demo')}
                <ArrowRight size={17} />
              </a>
            </div>
            <small>
              {t(
                'একটি মূল নকশা · তিনটি palette · চূড়ান্ত মূল্য ও hosting-এর মেয়াদ পরে নিশ্চিত হবে',
                'One composition · three palettes · pricing and hosting terms to be confirmed',
              )}
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
