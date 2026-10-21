import { Experience } from '@/components/experience';
import { redirect } from 'next/navigation';
import { deploymentSurface } from '@/features/production/surface';
export const dynamic = 'force-dynamic';
export default function Page() {
  if (deploymentSurface() === 'pilot') redirect('/dashboard/');
  return <Experience view="home" />;
}
