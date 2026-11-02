import { OrderIntro } from '@/components/storefront-pages';
import { notFound } from 'next/navigation';
import { parseNamesParam } from '@/components/storefront-names';
import { deploymentSurface } from '@/features/production/surface';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; names?: string }>;
}) {
  // Outside the proxy, so the pilot surface is enforced here.
  if (deploymentSurface() === 'pilot') notFound();
  const { template, names } = await searchParams;
  return <OrderIntro templateId={template} names={parseNamesParam(names)} />;
}
