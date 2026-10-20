import { Experience } from '@/components/experience';
import { redirect } from 'next/navigation';
import { isDemo } from '@/server/config';
export default function OperatorPage() {
  if (!isDemo()) redirect('/admin/orders/');
  return <Experience view="operator" />;
}
