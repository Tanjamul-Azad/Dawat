'use client';
import { useRef, useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { useProductLocale } from './production/product-locale';
import { manualPayment, orderPaymentReference } from '@/features/production/payment';
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

export function ManualPayment({ requestId, amountMinor }: { requestId?: string; amountMinor?: number }) {
  const { locale } = useProductLocale();
  const t = (bn: string, en: string) => (locale === 'bn' ? bn : en);
  const reference = requestId ? orderPaymentReference(requestId) : null;
  return (
    <section className={s.panel} aria-label={t('bKash পেমেন্টের নির্দেশনা', 'bKash payment instructions')}>
      <div className={s.heading}>
        <div>
          <span className={s.eyebrow}>{t('সহজ, সরাসরি পেমেন্ট', 'SIMPLE, DIRECT PAYMENT')}</span>
          <h3>{t('বিকাশে টাকা পাঠান', 'Pay with bKash')}</h3>
        </div>
        <span className={s.method}>bKash Personal</span>
      </div>
      {amountMinor !== undefined && (
        <p className={s.amount}>
          {t('অর্ডারের মূল্য', 'Order amount')}{' '}
          <strong>
            {new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
              style: 'currency',
              currency: 'BDT',
              maximumFractionDigits: 2,
            }).format(amountMinor / 100)}
          </strong>
        </p>
      )}
      <div className={s.details}>
        <CopyDetail label={t('বিকাশ personal নম্বর', 'bKash personal number')} value={manualPayment.number} />
        {reference && (
          <CopyDetail
            key={reference}
            label={t('Reference-এ লিখুন', 'Transfer reference')}
            value={reference}
          />
        )}
      </div>
      {reference ? (
        <ol className={s.steps}>
          <li>
            {t(
              'বিকাশ অ্যাপে Send Money খুলে উপরের personal নম্বর ও অর্ডারের মূল্য দিন।',
              'In the bKash app, open Send Money and enter the personal number and order amount above.',
            )}
          </li>
          <li>
            {t(
              'Reference ঘরে উপরের অর্ডার reference দিন। নম্বর ও পরিমাণ মিলিয়ে অ্যাপে টাকা পাঠানো সম্পন্ন করুন।',
              'Enter the order reference above in the Reference field. Check the number and amount, then complete the transfer in the app.',
            )}
          </li>
          <li>
            {t(
              'সফল হলে বিকাশের SMS বা transaction details থেকে TrxID কপি করুন। নিচের ফর্মে প্রেরকের নম্বর ও Transaction ID জমা দিন।',
              'After a successful transfer, copy the TrxID from the bKash SMS or transaction details. Submit it below with the sender number.',
            )}
          </li>
        </ol>
      ) : (
        <>
          <p className={s.note}>
            {t(
              'অর্ডারের মূল্য, মেয়াদ ও শর্ত নিশ্চিত হওয়ার পর এই personal নম্বরে Send Money করুন। আপনার অর্ডারের পেমেন্ট ধাপে নিজের reference এবং Transaction ID জমা দেওয়ার ফর্ম পাবেন।',
              'After agreeing your order price, term and scope, use Send Money to this personal number. Your order’s payment step provides your reference and the transaction ID form.',
            )}
          </p>
          <a className={s.orderLink} href="/order/requests/">
            {t('আমার অর্ডার ও পেমেন্ট', 'My orders & payment')}
            <ArrowRight size={14} />
          </a>
        </>
      )}
      <p className={s.note}>
        {t(
          'টাকা পাঠানোর পর আমাদের টিম আসল লেনদেন মিলিয়ে যাচাই করবে। যাচাই ও activation সম্পন্ন হলে পোর্টাল খুলবে।',
          'Our team manually matches the actual transfer. Your portal opens after verification and activation.',
        )}
      </p>
    </section>
  );
}
