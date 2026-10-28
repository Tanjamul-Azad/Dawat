import 'server-only';
import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
export const secret = () => randomBytes(32).toString('base64url');
export const digest = (token: string) => createHash('sha256').update(token, 'utf8').digest('hex');
function keyRing() {
  const id = process.env.GUEST_LINK_KEY_ID;
  const raw = process.env.GUEST_LINK_KEYS;
  if (!id || !raw || !/^[a-zA-Z0-9_-]{1,40}$/.test(id))
    throw new Error('Guest link key configuration is missing.');
  const keys = JSON.parse(raw) as Record<string, string>;
  const current = keys[id];
  if (!current || Buffer.from(current, 'base64').length !== 32)
    throw new Error('Guest link encryption requires 32-byte keys.');
  return { id, keys };
}
const aad = (wid: string, hid: string, id: string, purpose: string) => Buffer.from(`dawat:${purpose}:v1:${wid}:${hid}:${id}`);
export function encryptLink(token: string, wid: string, hid: string, purpose = 'guest-link') {
  const { id, keys } = keyRing();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(keys[id], 'base64'), iv);
  cipher.setAAD(aad(wid, hid, id, purpose));
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  return {
    keyId: id,
    ciphertext: [iv, cipher.getAuthTag(), ciphertext].map((b) => b.toString('base64url')).join('.'),
  };
}
export function decryptLink(ciphertext: string, id: string, wid: string, hid: string, purpose = 'guest-link') {
  const { keys } = keyRing();
  const key = keys[id];
  if (!key || Buffer.from(key, 'base64').length !== 32)
    throw new Error('A retained link key is unavailable. Restore the key before copying this link.');
  const parts = ciphertext.split('.');
  if (parts.length !== 3) throw new Error('Invalid encrypted link.');
  const [iv, tag, body] = parts.map((s) => Buffer.from(s, 'base64url'));
  if (iv.length !== 12 || tag.length !== 16) throw new Error('Invalid encrypted link.');
  const cipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'base64'), iv);
  cipher.setAAD(aad(wid, hid, id, purpose));
  cipher.setAuthTag(tag);
  const token = Buffer.concat([cipher.update(body), cipher.final()]).toString('utf8');
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) throw new Error('Invalid link token.');
  return token;
}
