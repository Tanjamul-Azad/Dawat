import type { DraftContent } from './contracts';

export const templateWording = {
  hosts: 'দুই পরিবারের পক্ষ থেকে',
  message:
    'জীবনের নতুন অধ্যায়ে একসঙ্গে পথচলা শুরু করছি আমরা। এই আনন্দের দিনে আপনাদের সাদর আমন্ত্রণ। আপনাদের উপস্থিতি, ভালোবাসা ও শুভকামনায় আমাদের আয়োজন পূর্ণ হয়ে উঠুক।',
  messageEn:
    'As we begin a new chapter together, we warmly invite you to celebrate with us. Your presence, love and good wishes will make our day complete.',
};

// Fill only missing wording. Never replace a couple's saved personal text.
export function withTemplateWording(content: DraftContent): DraftContent {
  return {
    ...content,
    hosts: content.hosts.trim() ? content.hosts : templateWording.hosts,
    message: content.message.trim() ? content.message : templateWording.message,
    messageEn: content.messageEn?.trim() ? content.messageEn : templateWording.messageEn,
  };
}
