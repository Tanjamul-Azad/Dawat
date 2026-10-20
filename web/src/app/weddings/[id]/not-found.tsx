import { WorkspaceFrame } from '@/components/production/frame';
import { ProductText } from '@/components/production/product-locale';
export default function NotFound() {
  return (
    <WorkspaceFrame>
      <h1>
        <ProductText en="Workspace unavailable." bn="কর্মপরিসর পাওয়া যাচ্ছে না।" />
      </h1>
      <p>
        <ProductText
          en="This account cannot manage this wedding right now. Sign in with the intended account or ask your seller to review access."
          bn="এই অ্যাকাউন্টে এখন আয়োজনটি পরিচালনা করা যাবে না। নির্ধারিত ইমেইলে প্রবেশ করুন বা বিক্রেতাকে প্রবেশাধিকার যাচাই করতে বলুন।"
        />
      </p>
      <a className="button" href="/dashboard/">
        <ProductText en="Back to my weddings" bn="আমার আয়োজনে ফিরুন" />
      </a>
    </WorkspaceFrame>
  );
}
