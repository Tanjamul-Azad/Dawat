import 'server-only';
import nodemailer, { type Transporter } from 'nodemailer';

// Order notifications by email through one SMTP account (a dedicated Gmail with an App Password,
// never the account that sends sign-in codes). With no MAIL_SMTP_USER/PASSWORD nothing is sent and
// every caller carries on: email is a courtesy, never a step an order depends on.
export type Mail = { to: string; subject: string; text: string; html: string };

let cached: { key: string; transport: Transporter } | undefined;
function transport() {
  const user = process.env.MAIL_SMTP_USER?.trim();
  const pass = process.env.MAIL_SMTP_PASSWORD?.replace(/\s+/g, '');
  if (!user || !pass) return null;
  const host = process.env.MAIL_SMTP_HOST?.trim() || 'smtp.gmail.com';
  const port = Number(process.env.MAIL_SMTP_PORT) || 465;
  const key = `${host}:${port}:${user}`;
  if (cached?.key !== key)
    cached = {
      key,
      transport: nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        // The local test inbox (Mailpit) takes plain SMTP without login.
        auth: ['127.0.0.1', 'localhost'].includes(host) ? undefined : { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      }),
    };
  return { transport: cached.transport, from: process.env.MAIL_FROM?.trim() || `দাওয়াত <${user}>` };
}

export const mailEnabled = () => transport() !== null;
export const adminRecipients = () =>
  (process.env.MAIL_ADMIN_TO ?? '')
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);

/** Sends one message; returns false instead of throwing so the calling action always completes. */
export async function sendMail(mail: Mail) {
  const t = transport();
  if (!t || !mail.to) return false;
  try {
    await t.transport.sendMail({ from: t.from, ...mail });
    return true;
  } catch (e) {
    // Log the kind of failure only: addresses and message bodies stay out of logs.
    console.error('Notification email failed:', (e as { code?: string }).code ?? 'SEND_FAILED');
    return false;
  }
}
