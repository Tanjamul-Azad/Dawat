import type { MetadataRoute } from 'next';
import { productionOrigin } from '@/features/production/environment';
export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/templates/', '/pricing/', '/contact/', '/policies/'].map((path) => ({
    url: productionOrigin + path,
    changeFrequency: 'monthly' as const,
    priority: path === '/' ? 1 : 0.7,
  }));
}
