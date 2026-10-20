import { useId, type ReactNode } from 'react';
import s from './stationery-art.module.css';

// Adapted from the user's supplied Figma Make SVG stationery; no external artwork.
export function WovenPattern({ className = '' }: { className?: string }) {
  const id = `weave-${useId().replace(/\W/g, '')}`;
  return (
    <svg className={`${s.weave} ${className}`} aria-hidden="true">
      <defs>
        <pattern id={id} width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M16 2 30 16 16 30 2 16Z M16 8 24 16 16 24 8 16Z"
            fill="none"
            stroke="currentColor"
            strokeWidth=".7"
          />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export function Vine({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 24"
      className={`${s.vine} ${className}`}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
    >
      <path d="M0 12C30 2 50 22 80 12S130 2 160 12 210 22 240 12" />
      {[20, 60, 100, 140, 180, 220].map((x, index) => (
        <ellipse
          key={x}
          cx={x}
          cy={index % 2 ? 18 : 6}
          rx="6"
          ry="2.6"
          fill="currentColor"
          fillOpacity=".22"
        />
      ))}
    </svg>
  );
}

export function WaxSeal() {
  return (
    <svg viewBox="0 0 48 48" className={s.wax} aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#451019" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="#d3b06a" strokeWidth=".8" />
      <g fill="#d3b06a">
        <ellipse cx="24" cy="15" rx="3" ry="6" />
        <ellipse cx="24" cy="33" rx="3" ry="6" />
        <ellipse cx="15" cy="24" rx="6" ry="3" />
        <ellipse cx="33" cy="24" rx="6" ry="3" />
      </g>
      <circle cx="24" cy="24" r="2.5" fill="#451019" />
    </svg>
  );
}

export function EnvelopeArtwork({
  names,
  date,
  opened = false,
  seal,
}: {
  names: string;
  date: string;
  opened?: boolean;
  seal?: ReactNode;
}) {
  return (
    <div className={s.envelope} data-open={opened}>
      <div className={s.back}>
        <WovenPattern />
      </div>
      <div className={s.note}>
        <Vine />
        <span className={s.noteNames}>{names}</span>
        <span className={s.noteDate}>{date}</span>
      </div>
      <div className={s.pocket}>
        <WovenPattern />
      </div>
      <div className={s.flap}>
        <WovenPattern />
      </div>
      <div className={s.sealSlot}>{seal ?? <WaxSeal />}</div>
    </div>
  );
}
