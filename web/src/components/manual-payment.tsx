'use client';
import { useRef, useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import { manualPayment, orderPaymentReference } from '@/features/production/payment';
import { takaFromPaisa } from '@/features/production/money';
import s from './manual-payment.module.css';

function CopyDetail({ label, value }: { label: string; value: string }) {
  const { locale } = useProductLocale();
  const input = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState('');
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFeedback(locale === 'bn' ? 'কপি হয়েছে।' : 'Copied.');
    } catch {
      setCopied(false);
      input.current?.focus();
      input.current?.select();
      setFeedback(
        locale === 'bn' ? 'নিচের নির্বাচিত লেখাটি নিজে কপি করুন।' : 'Copy the selected value manually.',
      );
    }
  }
  return (
    <div className={s.detail}>
      <label>
        {label}
        <input ref={input} value={value} readOnly dir="ltr" onFocus={(e) => e.currentTarget.select()} />
      </label>
      <button
        type="button"
        onClick={() => void copy()}
        aria-label={`${label} ${locale === 'bn' ? 'কপি করুন' : 'copy'}`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />} {locale === 'bn' ? 'কপি' : 'Copy'}
      </button>
      <span className={s.feedback} role="status">
        {feedback}
      </span>
    </div>
  );
}

export function ManualPayment({
  requestId,
  amountMinor,
  embedded = false,
}: {
  requestId?: string;
  amountMinor?: number;
  embedded?: boolean;
}) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const reference = requestId ? orderPaymentReference(requestId) : null;
  return (
    <section
      className={s.panel}
      data-embedded={embedded}
      id="payment"
      aria-label={t('বিকাশ পেমেন্টের নির্দেশনা', 'bKash payment instructions')}
    >
      <div className={s.infoBox}>
        <div className={s.heading}>
          <div>
            {!embedded && (
              <span className={s.eyebrow}>{t('সহজ, সরাসরি পেমেন্ট', 'SIMPLE, DIRECT PAYMENT')}</span>
            )}
            <h3>{t('পরিশোধের তথ্য', 'Payment details')}</h3>
          </div>
          {amountMinor !== undefined && (
            <p className={s.amount}>
              {t('মোট পরিশোধযোগ্য', 'Order amount')} <strong>{takaFromPaisa(amountMinor, locale)}</strong>
            </p>
          )}
        </div>
        <div className={s.details}>
          <div className={s.methodColumn}>
            <span>{t('পেমেন্ট মাধ্যম', 'Payment method')}</span>
            <strong className={s.method}>bKash Personal</strong>
          </div>
          <CopyDetail
            label={t('বিকাশ পার্সোনাল নম্বর', 'bKash personal number')}
            value={manualPayment.number}
          />
          {reference && (
            <CopyDetail
              key={reference}
              label={t('রেফারেন্সে লিখুন', 'Transfer reference')}
              value={reference}
            />
          )}
        </div>
      </div>
      {reference ? (
        <>
          <h3 className={s.sectionTitle}>
            {t('পেমেন্ট করার নিয়ম', 'How to pay')}
            <span />
          </h3>
          <ol className={s.steps}>
            <li>
              <strong>
                {t('দাম ও শর্ত দেখে অর্ডার নিশ্চিত করুন', 'Confirm the price, terms and order')}
              </strong>
              {t(
                'সম্মত নকশা, মূল্য ও মেয়াদ মিলিয়ে নিন।',
                'Review your agreed design, scope, price and hosting term.',
              )}
            </li>
            <li>
              <strong>{t('বিকাশে টাকা পাঠান', 'Send Money through bKash')}</strong>
              {t(
                `বিকাশ পার্সোনাল ${manualPayment.number} নম্বরে Send Money করুন। রেফারেন্সে ${reference} লিখুন।`,
                `Use Send Money to bKash Personal ${manualPayment.number}. Enter ${reference} as the reference and check the number and amount.`,
              )}
            </li>
            <li>
              <strong>{t('লেনদেনের তথ্য জমা দিন', 'Submit your transaction details')}</strong>
              {t(
                'সফল লেনদেনের প্রেরক নম্বর ও বিকাশের SMS থেকে পাওয়া Transaction ID নিচে দিন।',
                'After a successful transfer, copy the TrxID from the bKash SMS or transaction details. Submit it below with the sender number.',
              )}
            </li>
          </ol>
        </>
      ) : (
        <>
          <p className={s.note}>
            {t(
              'অর্ডারের মূল্য, মেয়াদ ও শর্ত নিশ্চিত হওয়ার পর এই পার্সোনাল নম্বরে Send Money করুন। আপনার অর্ডারের পেমেন্ট ধাপে নিজের রেফারেন্স এবং Transaction ID জমা দেওয়ার ফর্ম পাবেন।',
              'After agreeing your order price, term and scope, use Send Money to this personal number. Your order’s payment step provides your reference and the transaction ID form.',
            )}
          </p>
          <a className={s.orderLink} href="/order/requests/">
            {t('আমার অর্ডার ও পেমেন্ট', 'My orders & payment')}
            <ArrowRight size={14} />
          </a>
        </>
      )}
      {!embedded && (
        <p className={s.note}>
          {t(
            'টাকা পাঠানোর পর আমাদের টিম আসল লেনদেন মিলিয়ে যাচাই করবে। যাচাই শেষে পোর্টাল চালু হলে তা খুলবে।',
            'Our team manually matches the actual transfer. Your portal opens after verification and activation.',
          )}
        </p>
      )}
    </section>
  );
}
