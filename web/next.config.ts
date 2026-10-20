import type { NextConfig } from 'next';

const config: NextConfig = {
  distDir: process.env.DAWAT_LOCAL_QA === '1' ? '.next-local' : '.next',
  trailingSlash: true,
  images: { unoptimized: true },
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
