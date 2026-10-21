import { expect, it } from 'vitest';
import { assertEnvironment, productionBackend, productionOrigin } from './environment';
const production = {
  environment: 'production',
  backend: productionBackend,
  origin: productionOrigin,
  surface: 'pilot',
};
it('accepts only the approved production project/origin/context', () => {
  expect(() => assertEnvironment({ ...production, context: 'production' })).not.toThrow();
  for (const change of [
    { environment: 'staging' },
    { environment: 'development' },
    { origin: 'http://127.0.0.1:3000' },
    { origin: 'https://preview.vercel.app' },
    { backend: 'https://other.supabase.co' },
    { surface: 'all' },
    { context: 'deploy-preview' },
    { context: 'branch-deploy' },
    { context: 'dev' },
  ])
    expect(() => assertEnvironment({ ...production, ...change })).toThrow();
});
it('keeps recovery and development on distinct local services', () => {
  expect(() =>
    assertEnvironment({
      environment: 'recovery',
      backend: 'http://127.0.0.1:55321',
      origin: 'http://127.0.0.1:3104',
    }),
  ).not.toThrow();
  expect(() =>
    assertEnvironment({
      environment: 'recovery',
      backend: 'http://127.0.0.1:54321',
      origin: 'http://127.0.0.1:3104',
    }),
  ).toThrow();
  expect(() =>
    assertEnvironment({
      environment: 'development',
      backend: 'http://127.0.0.1:54321',
      origin: 'http://127.0.0.1:3102',
    }),
  ).not.toThrow();
  expect(() => assertEnvironment({ ...production, environment: 'misspelled' })).toThrow();
});
