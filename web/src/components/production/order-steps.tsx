'use client';
import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { useProductLocale } from './product-locale';
import s from './order-steps.module.css';

// Where the buyer is in the order journey, shown on sign-in and on the first order form.
const steps = [
  ['নকশা বাছাই', 'Design'],
  ['ইমেইল যাচাই', 'Email'],
  ['আয়োজনের তথ্য', 'Details'],
  ['দাম ও পেমেন্ট', 'Price & payment'],
  ['পাতা চালু', 'Page opens'],
] as const;

export function OrderSteps({ current }: { current: number }) {
  const { locale } = useProductLocale();
  const bn = locale === 'bn';
  const digits = (n: number) => (bn ? new Intl.NumberFormat('bn-BD').format(n) : String(n));
  const here = steps[current - 1];
  return (
    <nav
      className={s.steps}
      aria-label={bn ? 'অর্ডারের ধাপ' : 'Order steps'}
      style={{ '--done': (current - 1) / (steps.length - 1) } as CSSProperties}
    >
      <p className={s.summary}>
        {bn
          ? `ধাপ ${digits(current)} / ${digits(steps.length)} · ${here[0]}`
          : `Step ${current} of ${steps.length} · ${here[1]}`}
      </p>
      <ol>
        {steps.map(([b, e], i) => (
          <li
            key={e}
            data-state={i + 1 < current ? 'done' : i + 1 === current ? 'here' : 'next'}
            aria-current={i + 1 === current ? 'step' : undefined}
          >
            <span aria-hidden="true">
              {i + 1 < current ? <Check size={12} strokeWidth={3} /> : digits(i + 1)}
            </span>
            <small>{bn ? b : e}</small>
          </li>
        ))}
      </ol>
    </nav>
  );
}
