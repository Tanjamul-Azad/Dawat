import { describe, it, expect, vi, afterEach } from 'vitest';
vi.mock('server-only', () => ({}));
import { digest, encryptLink, decryptLink, secret } from './guest-crypto';
afterEach(() => vi.unstubAllEnvs());
describe('Recoverable, identity-bound guest credentials', () => {
  const setup = () => {
    vi.stubEnv('GUEST_LINK_KEY_ID', 'v1');
    vi.stubEnv('GUEST_LINK_KEYS', JSON.stringify({ v1: Buffer.alloc(32, 42).toString('base64') }));
  };
  it('creates 256-bit unguessable credentials and stores only authenticated ciphertext', () => {
    setup();
    const token = secret();
    const enc = encryptLink(token, 'wedding-a', 'household-a');
    expect(token).toMatch(/^[\w-]{43}$/);
    expect(digest(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(enc.ciphertext).not.toContain(token);
    expect(decryptLink(enc.ciphertext, enc.keyId, 'wedding-a', 'household-a')).toBe(token);
  });
  it('rejects swapped tenant/household/key identities and modified ciphertext', () => {
    setup();
    const enc = encryptLink(secret(), 'x', 'a');
    expect(() => decryptLink(enc.ciphertext, 'v1', 'y', 'a')).toThrow();
    expect(() => decryptLink(enc.ciphertext, 'v1', 'x', 'b')).toThrow();
    expect(() => decryptLink('A' + enc.ciphertext.slice(1), 'v1', 'x', 'a')).toThrow();
  });
  it('fails closed for missing or wrong-sized keys', () => {
    vi.stubEnv('GUEST_LINK_KEYS', '{}');
    expect(() => encryptLink(secret(), 'w', 'h')).toThrow();
    vi.stubEnv('GUEST_LINK_KEY_ID', 'v1');
    vi.stubEnv('GUEST_LINK_KEYS', '{"v1":"short"}');
    expect(() => encryptLink(secret(), 'w', 'h')).toThrow();
  });
  it('recovers links after key rotation only while the original key is retained', () => {
    setup();
    const token = secret();
    const old = encryptLink(token, 'wedding', 'household');
    vi.stubEnv('GUEST_LINK_KEY_ID', 'v2');
    vi.stubEnv(
      'GUEST_LINK_KEYS',
      JSON.stringify({
        v1: Buffer.alloc(32, 42).toString('base64'),
        v2: Buffer.alloc(32, 99).toString('base64'),
      }),
    );
    expect(decryptLink(old.ciphertext, old.keyId, 'wedding', 'household')).toBe(token);
    expect(encryptLink(secret(), 'wedding', 'household').keyId).toBe('v2');
    vi.stubEnv('GUEST_LINK_KEYS', JSON.stringify({ v2: Buffer.alloc(32, 99).toString('base64') }));
    expect(() => decryptLink(old.ciphertext, old.keyId, 'wedding', 'household')).toThrow(/retained link key/);
  });
});
