import { OrderIntro } from '@/components/storefront-pages';
import { parseNamesParam } from '@/components/storefront-names';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ template?: string; names?: string }>;
}) {
  const { template, names } = await searchParams;
  return <OrderIntro templateId={template} names={parseNamesParam(names)} />;
}
