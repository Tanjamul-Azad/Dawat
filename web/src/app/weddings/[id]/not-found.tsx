import { WorkspaceFrame } from '@/components/production/frame';
import { ProductText } from '@/components/production/product-locale';
import { pageSession } from '@/server/auth';
import { DAWAT_CONTACT_HREF, DAWAT_CONTACT_EMAIL } from '@/features/production/brand';
export default async function NotFound() {
  const account = await pageSession('/dashboard/');
  return (
    <WorkspaceFrame email={account?.user.email}>
      <h1>
        <ProductText en="Workspace unavailable." bn="কর্মপরিসর পাওয়া যাচ্ছে না।" />
      </h1>
      <p>
        <ProductText
          en="This account cannot manage this wedding right now. Sign in with the intended account or ask your seller to review access."
          bn="এই অ্যাকাউন্টে এখন আয়োজনটি পরিচালনা করা যাবে না। নির্ধারিত ইমেইলে প্রবেশ করুন বা বিক্রেতাকে প্রবেশাধিকার যাচাই করতে বলুন।"
        />
      </p>
      <p>
        <ProductText
          en="If you are signed in with another email, sign out above and open the original workspace link again. Access may also be waiting for activation or paused by your seller."
          bn="অন্য ইমেইলে প্রবেশ করে থাকলে উপরে ‘বেরিয়ে যান’ চেপে নির্ধারিত ইমেইলে প্রবেশ করুন। প্রবেশাধিকার চালু হওয়ার অপেক্ষায় বা সাময়িক বন্ধও থাকতে পারে।"
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
