import { Experience } from '@/components/experience';
import { WorkspaceFrame } from '@/components/production/frame';
import { isDemo } from '@/server/config';
import { ProductText } from '@/components/production/product-locale';
export default function OrderPage() {
  if (!isDemo())
    return (
      <WorkspaceFrame>
        <h1>
          <ProductText en="Arrange your invitation." bn="আপনার আমন্ত্রণের আয়োজন করুন।" />
        </h1>
        <p>
          <ProductText
            en="Orders are currently arranged with the seller. After your order is confirmed and access activated, sign in using the agreed customer email."
            bn="অর্ডারের জন্য বিক্রেতার সঙ্গে যোগাযোগ করুন। অর্ডার নিশ্চিত ও প্রবেশাধিকার চালু হলে নির্ধারিত গ্রাহকের ইমেইল দিয়ে প্রবেশ করুন।"
          />
        </p>
        <a className="button" href="/auth/login/">
          <ProductText en="Sign in to your workspace" bn="আপনার কর্মপরিসরে প্রবেশ করুন" />
        </a>
      </WorkspaceFrame>
    );
  return <Experience view="order" />;
}
