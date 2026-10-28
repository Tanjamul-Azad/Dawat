import type { NextConfig } from 'next';
import { assertEnvironment } from './src/features/production/environment';

assertEnvironment({
  environment: process.env.DAWAT_ENVIRONMENT,
  backend: process.env.NEXT_PUBLIC_SUPABASE_URL,
  origin: process.env.APP_ORIGIN,
  context: process.env.CONTEXT,
  surface: process.env.DAWAT_SURFACE,
});

const config: NextConfig = {
  env: { NEXT_PUBLIC_PAYMENT_REVIEW_PROMISE_BN: process.env.PAYMENT_REVIEW_PROMISE_BN ?? '', NEXT_PUBLIC_PAYMENT_REVIEW_PROMISE_EN: process.env.PAYMENT_REVIEW_PROMISE_EN ?? '' },
  // Keep the isolated local rehearsal usable alongside its Docker database.
  experimental: process.env.DAWAT_LOCAL_QA === '1' ? { cpus: 1 } : undefined,
  output: process.env.DAWAT_STANDALONE === '1' ? 'standalone' : undefined,
  distDir:
    process.env.DAWAT_RECOVERY_QA === '1'
      ? '.next-recovery'
      : process.env.DAWAT_LOCAL_QA === '1'
        ? '.next-local'
        : '.next',
  trailingSlash: true,
  images: { unoptimized: true },
  // Link-preview images read the Bengali font and template art from disk at request time.
  outputFileTracingIncludes: {
    '/og/*': ['./assets/og/**/*', './public/brand/*.webp'],
    '/i/*/og.jpg': ['./assets/og/**/*', './public/brand/*.webp'],
  },
  outputFileTracingExcludes: {
    '/og/*': ['./public/{audio,artwork,fonts,licenses}/**/*'],
    '/i/*/og.jpg': ['./public/{audio,artwork,fonts,licenses}/**/*'],
  },
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default config;
