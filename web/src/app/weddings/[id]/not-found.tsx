import { WorkspaceFrame } from '@/components/production/frame';
import { ProductText } from '@/components/production/product-locale';
import { pageSession } from '@/server/auth';
import { DAWAT_CONTACT_HREF, DAWAT_CONTACT_EMAIL } from '@/features/production/brand';
export default async function NotFound() {
  const account = await pageSession('/dashboard/');
  return (
    <WorkspaceFrame email={account?.user.email}>
      <h1>
        <ProductText en="Workspace unavailable." bn="আয়োজনের পাতা পাওয়া যাচ্ছে না।" />
      </h1>
      <p>
        <ProductText
          en="This account cannot manage this wedding right now. Sign in with the intended account or ask the Dawat team to check access."
          bn="এই অ্যাকাউন্ট দিয়ে এখন আয়োজনটি এডিট করা যাবে না। অর্ডারের ইমেইল দিয়ে লগইন করুন, অথবা দাওয়াত টিমকে অ্যাক্সেস দেখতে বলুন।"
        />
      </p>
      <p>
        <ProductText
          en="If you are signed in with another email, sign out above and open the original workspace link again. Access may also be waiting for activation or paused by the Dawat team."
          bn="অন্য ইমেইলে লগইন করা থাকলে উপরে ‘লগআউট’ চেপে অর্ডারের ইমেইলে আবার লগইন করুন। অ্যাক্সেস এখনো চালু না হয়ে থাকতে পারে, বা সাময়িক বন্ধ থাকতে পারে।"
        />
      </p>
      <a className="button" href="/dashboard/?all=1">
        <ProductText en="Back to my weddings" bn="আমার আয়োজনে ফিরুন" />
      </a>
      <p>
        <a href={DAWAT_CONTACT_HREF}>{DAWAT_CONTACT_EMAIL}</a>
      </p>
    </WorkspaceFrame>
  );
}
