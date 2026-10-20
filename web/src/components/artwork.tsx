import type { CSSProperties } from 'react';
import styles from './invitation-cover.module.css';
import { type Guest, type Invitation, type Theme } from '@/features/workspace/model';
import { eventText, formatDate, localNames, type Locale } from '@/features/invitation/content';

export function Botanical({ className = '', tone = 'currentColor' }: { className?: string; tone?: string }) {
  return (
    <svg viewBox="0 0 240 410" className={`botanical ${className}`} fill="none" aria-hidden="true">
      <g stroke={tone} strokeWidth="1.25" strokeLinecap="round">
        <path d="M105 399C108 332 96 284 113 224C130 161 164 101 158 15M112 271C69 247 47 228 31 193M121 199C172 173 201 143 216 108M111 325C157 303 182 280 200 245M148 116C107 100 88 78 74 47" />
        <path d="M153 56C124 43 118 27 127 11C149 13 164 33 153 56ZM157 79C185 73 197 55 189 38C166 44 152 59 157 79ZM143 131C160 104 185 97 197 112C187 136 167 142 143 131ZM130 165C100 155 85 135 96 119C121 123 135 143 130 165ZM119 212C145 211 169 219 167 239C141 247 124 233 119 212ZM110 258C79 250 58 253 55 273C79 283 103 275 110 258ZM110 299C135 271 159 268 170 285C158 309 135 313 110 299ZM111 352C87 321 65 317 52 331C61 354 87 363 111 352ZM53 225C28 231 9 216 12 200C33 195 48 205 53 225ZM187 152C181 124 190 101 208 104C220 125 208 145 187 152ZM175 282C163 259 168 235 187 233C201 252 197 270 175 282Z" />
        <g transform="translate(66 80)">
          <path d="M0 0C-17-14-30-10-29 1C-40 13-25 26-12 18C-5 35 12 27 10 14C29 14 26-5 14-8C12-26-4-22 0 0Z" />
          <circle cx="-6" cy="7" r="4" />
        </g>
        <g transform="translate(209 206) scale(.8)">
          <path d="M0 0C-17-14-30-10-29 1C-40 13-25 26-12 18C-5 35 12 27 10 14C29 14 26-5 14-8C12-26-4-22 0 0Z" />
          <circle cx="-6" cy="7" r="4" />
        </g>
      </g>
    </svg>
  );
}

export function InvitationCover({
  invitation,
  guest,
  compact = false,
  theme,
  opened = false,
  locale = 'en',
}: {
  invitation: Invitation;
  guest?: Guest;
  compact?: boolean;
  theme?: Theme;
  opened?: boolean;
  locale?: Locale;
}) {
  const selected = theme ?? invitation.theme;
  const names = localNames(invitation, locale);
  const longestName = Math.max(...names.map((name) => name.length));
  return (
    <div
      className={`${styles.cover} ${styles[selected]} ${compact ? styles.compact : ''} ${opened ? 'cover-opened' : ''}`}
      lang={locale}
      style={
        { '--name-size': `${Math.max(6, Math.min(13, 140 / Math.max(10, longestName)))}cqw` } as CSSProperties
      }
    >
      <picture className={styles.art} aria-hidden="true">
        <source
          srcSet="/artwork/jamdani-ivory-v2-640.webp 640w, /artwork/jamdani-ivory-v2-1024.webp 1024w"
          sizes="(max-width: 700px) 90vw, 400px"
          type="image/webp"
        />
        <img src="/artwork/jamdani-ivory-v2-640.webp" width={640} height={960} alt="" />
      </picture>
      <span className={styles.eyebrow}>
        {guest
          ? guest.greeting || guest.name
          : locale === 'bn'
            ? invitation.hostsBn || invitation.hosts
            : invitation.hosts}
      </span>
      <div className={styles.monogram}>
        <span aria-hidden="true">✧</span>
        <i>&</i>
        <span aria-hidden="true">✧</span>
      </div>
      <div className={styles.names}>
        <span>{names[0]}</span>
        <i>&</i>
        <span>{names[1]}</span>
      </div>
      <p className={styles.occasion}>
        {locale === 'bn' ? 'শুরু হচ্ছে একসঙ্গে পথচলা' : 'ARE GETTING MARRIED'}
      </p>
      <div className={styles.divider}>
        <span />✧<span />
      </div>
      <p className={styles.date}>{formatDate(invitation.events[1].date, locale)}</p>
      {invitation.events[1].address.length <= 80 && (
        <p className={styles.place}>{eventText(invitation.events[1], locale).address}</p>
      )}
      <p className={styles.bangla} lang="bn">
        ভালোবাসার নতুন অধ্যায়ে
      </p>
    </div>
  );
}
