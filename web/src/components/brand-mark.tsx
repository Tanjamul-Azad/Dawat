import type { CSSProperties } from 'react';
export function LotusMark({ size = 34, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 44"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.55"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d="M24 34C12 25 16 13 24 3c8 10 12 22 0 31Z" />
      <path d="M24 34C9 32 6 21 7 11c12 3 20 10 17 23Z" />
      <path d="M24 34c15-2 18-13 17-23-12 3-20 10-17 23Z" />
      <path d="M24 34C11 38 3 31 2 23c11-1 18 2 22 11Z" />
      <path d="M24 34c13 4 21-3 22-11-11-1-18 2-22 11Z" />
      <path d="M8 40c6-5 12-6 16-6s10 1 16 6c-8 2-13 0-16-6-3 6-8 8-16 6Z" />
    </svg>
  );
}
