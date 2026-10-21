import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    restoreMocks: true,
    include: ['src/**/*.test.{ts,tsx}', 'scripts/recovery/*.test.mjs'],
  },
});
