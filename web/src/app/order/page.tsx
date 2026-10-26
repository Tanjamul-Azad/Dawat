import { OrderIntro } from '@/components/storefront-pages';
export default async function Page({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  return <OrderIntro templateId={(await searchParams).template} />;
}
