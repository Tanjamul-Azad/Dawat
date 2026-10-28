// Hand-drawn jamdani-style ornaments, drawn here as plain SVG so the site needs no outside artwork.
import x from './storefront-sections.module.css';

/** A thin line with a diamond lattice in the middle, used between sections. */
export function JamdaniDivider({ tone = 'gold' }: { tone?: 'gold' | 'light' }) {
  return (
    <div className={x.divider} data-tone={tone} aria-hidden="true">
      <svg viewBox="0 0 360 28" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
        <path d="M0 14h132" opacity="0.55" />
        <path d="M228 14h132" opacity="0.55" />
        <path d="M180 3 191 14 180 25 169 14Z" />
        <path d="M180 8.5 185.5 14 180 19.5 174.5 14Z" fill="currentColor" stroke="none" opacity="0.9" />
        <path d="M156 14 147 8M156 14l-9 6M204 14l9-6M204 14l9 6" opacity="0.8" />
        <circle cx="140" cy="14" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="220" cy="14" r="1.6" fill="currentColor" stroke="none" />
        <path d="M118 14l-5-3-5 3 5 3ZM252 14l5-3 5 3-5 3Z" opacity="0.6" />
      </svg>
    </div>
  );
}

/** Four small corner flourishes for a framed card. Place inside a position:relative parent. */
export function CornerOrnaments() {
  return (
    <>
      {(['tl', 'tr', 'bl', 'br'] as const).map((corner) => (
        <svg
          key={corner}
          className={x.corner}
          data-corner={corner}
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 45V14C3 7 7 3 14 3h31" />
          <path d="M10 45V18c0-5 3-8 8-8h27" opacity="0.5" />
          <path d="M3 3l7 7M14 14l5 0" opacity="0.7" />
          <circle cx="22" cy="22" r="2.4" fill="currentColor" stroke="none" />
          <path d="M22 16.5 27.5 22 22 27.5 16.5 22Z" opacity="0.7" />
        </svg>
      ))}
    </>
  );
}
