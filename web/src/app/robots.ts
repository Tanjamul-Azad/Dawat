import type { MetadataRoute } from 'next';
import { productionOrigin } from '@/features/production/environment';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/templates/', '/pricing/', '/contact/', '/policies/'],
      disallow: [
        '/api/',
        '/admin/',
        '/auth/',
        '/dashboard/',
        '/weddings/',
        '/order/',
        '/i/',
        '/invite/',
        '/studio/',
        '/operator/',
      ],
    },
    sitemap: productionOrigin + '/sitemap.xml',
  };
}
