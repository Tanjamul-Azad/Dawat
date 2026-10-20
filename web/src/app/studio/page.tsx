import { Experience } from '@/components/experience';
import { redirect } from 'next/navigation';
import { isDemo } from '@/server/config';
export default function Page() {
  if (!isDemo()) redirect('/dashboard/');
  return <Experience view="studio" />;
}
