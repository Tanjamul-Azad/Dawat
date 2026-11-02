import { notFound } from 'next/navigation';
import { DashboardDesignPreview } from '@/components/design/dashboard-preview';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Dawat · Dashboard design preview',
  robots: { index: false, follow: false },
};

export default function Page() {
  // Synthetic design review only. This never skips authentication on a workspace route.
  if (
    process.env.DAWAT_LOCAL_QA !== '1' ||
    process.env.APP_ORIGIN !== 'http://127.0.0.1:3102' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'http://127.0.0.1:54321'
  )
    notFound();
  return <DashboardDesignPreview />;
}
