export const defaultInviteBn = 'আসসালামু আলাইকুম, {নাম}।\nআমাদের বিয়েতে আপনাদের দাওয়াত। নিচের লিংকে আমন্ত্রণপত্র দেখে আসবেন কি না জানিয়ে দিন।\n— {বর-কনে}\n{লিংক}';
export const defaultInviteEn = 'Hello {name},\nYou are invited to our wedding. Open the link below to see the invitation and let us know if you can come.\n— {couple}\n{link}';
export function renderInvite(template: string, values: { name: string; link: string; couple: string }) {
  const placeholders: Record<string, string> = { নাম: values.name, name: values.name, লিংক: values.link, link: values.link, 'বর-কনে': values.couple, couple: values.couple };
  const message = template.replace(/\{(নাম|name|লিংক|link|বর-কনে|couple)\}/g, (_, key: string) => placeholders[key]);
  return /\{(?:লিংক|link)\}/.test(template) ? message : `${message}\n${values.link}`;
}
export function waUrl(phone: string | null, text: string) {
  return `https://wa.me/${phone?.replace(/\D/g, '') ?? ''}?text=${encodeURIComponent(text)}`;
}
