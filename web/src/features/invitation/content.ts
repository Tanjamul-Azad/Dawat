import type { Guest, Invitation, Workspace } from '@/features/workspace/model';

export type Locale = 'bn' | 'en';
export const words = {
  en: {
    demo: 'An invitation to imagine. Fictional people & places.',
    sampleReply: 'Try the RSVP · sample replies stay in this browser, separate from customer orders.',
    preview: 'Read-only design preview · replies are unavailable here.',
    storageProblem:
      'Browser storage is unavailable or could not load the saved demo. Viewing still works; replies may not save.',
    collection: 'The collection',
    open: 'Open your invitation',
    openQuietly: 'Open without animation',
    finishOpening: 'Finish opening',
    addressedTo: 'ESPECIALLY FOR',
    fromCouple: 'WITH LOVE FROM',
    replyAs: 'REPLYING FOR',
    personalLinkTitle: 'A reply, especially yours.',
    personalLinkNote:
      'Please use the personal invitation link we shared with you to reply. Your name and invitation details will already be there.',
    skip: 'View the details',
    opening: 'A little paper magic…',
    pauseMotion: 'Pause animations',
    resumeMotion: 'Resume animations',
    quietMotion: 'Reduced motion is enabled on your device',
    playMusic: 'Play wedding music',
    pauseMusic: 'Pause wedding music',
    loadingMusic: 'Music is loading. Tap to cancel.',
    blockedMusic: 'Tap the music button to play our wedding melody.',
    failedMusic: 'Music could not load. You can retry with the music button.',
    musicCredit: 'Music credits',
    dateChapter: 'A DAY TO KEEP CLOSE',
    untieDate: 'Untie the date ribbon',
    foldDate: 'Fold the date ribbon',
    dateUnfolded: 'Our day, revealed',
    edition: 'THE JAMDANI EDITION',
    letter: 'A letter, carried with love.',
    personal: 'An invitation, especially for you',
    forYou: 'To our favourite people',
    wedding: 'ARE GETTING MARRIED',
    dateTba: 'Date to be announced',
    welcomeLabel: 'TWO FAMILIES. ONE BEAUTIFUL BEGINNING.',
    welcome: 'Some days feel like',
    welcomeEm: 'coming home.',
    hosts: 'Together with our families',
    welcomeNote: 'It would mean the world to have you beside us.',
    scroll: 'A story, unfolding',
    details: 'Celebrations',
    pictures: 'Our moments',
    reply: 'Your reply',
    anticipation: 'A LITTLE CLOSER, EVERY DAY',
    countdown: 'Counting the moments.',
    until: 'until',
    days: 'Days',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    past: 'The day has become a memory.',
    dateNote: 'Event times are in Bangladesh time (UTC+06:00).',
    programmeLabel: 'COME FOR THE MOMENTS. STAY FOR THE MEMORIES.',
    programme: 'The celebrations.',
    directions: 'Google Maps',
    calendar: 'Add to calendar',
    address: 'Copy address',
    copied: 'Address copied',
    copyFailed: 'Could not copy. Select the address below instead.',
    showMap: 'Show map',
    hideMap: 'Hide map',
    mapLabel: 'Map for',
    mapNote: 'Map provided by Google. If it does not load, use the address or directions link.',
    photoLabel: 'THE LITTLE THINGS, THE BIG FEELINGS',
    photoTitle: 'A glimpse of us.',
    photoNote: 'A few pages from our story.',
    photoCaption: 'A CLOSER LOOK',
    carousel: 'slideshow',
    photoSlide: 'Photograph',
    choosePhoto: 'Show photograph',
    pausePhotos: 'Pause slideshow',
    playPhotos: 'Play slideshow',
    photoOpen: 'Open photograph',
    close: 'Close',
    previous: 'Previous photograph',
    next: 'Next photograph',
    photoMissing: 'A moment kept in our hearts.',
    photoFree: 'No photograph could hold all this love.',
    photoFreeNote: 'A beautiful beginning, written in the company of our favourite people.',
    rsvpLabel: 'A PLACE AT OUR CELEBRATION',
    rsvpTitle: 'Will you be',
    rsvpEm: 'part of our day?',
    rsvpNote: 'A little reply helps us make room for all the love.',
    forEvent: 'Your reply for',
    name: 'Your name / family name',
    nameHint: 'How shall we address you?',
    attend: 'Will you join us?',
    yes: 'We’ll be there',
    no: 'Sadly, we can’t join',
    adults: 'Adults, including you',
    children: 'Children',
    note: 'Anything we should know for your visit?',
    optional: 'optional',
    submit: 'Send our reply',
    saving: 'Saving your reply…',
    saved: 'Received with love.',
    accepted: 'We look forward to celebrating with you.',
    declined: 'You will be with us in spirit. Thank you for letting us know.',
    edit: 'Edit your reply',
    people: 'people',
    allowance: 'Maximum people per celebration, including you',
    localSaved: 'Demo reply saved in this browser only.',
    privacy: 'Your reply is for the couple and their families. This sample saves only in this browser.',
    requiredName: 'Please add your name.',
    requiredWish: 'Please write a message before sending your wish.',
    countsInvalid: 'Enter whole numbers of people, using English or Bangla digits.',
    allowanceInvalid:
      'Your accepted reply must include at least one person and stay within the invitation allowance.',
    saveFailed: 'Your reply was not saved. Your answers are still here. Check browser storage and try again.',
    closed: 'Replies for this invitation are now closed.',
    invalidScope: 'This celebration is not included in your invitation.',
    wishLabel: 'WORDS WORTH KEEPING',
    wishTitle: 'Leave a little love.',
    wishFor: 'A keepsake for',
    wishNote:
      'Share a blessing, a favourite memory, or a few words for our new beginning. Your wishes are separate from your attendance reply.',
    wish: 'Your message to the couple',
    wishSend: 'Send a little love',
    wishThanks: 'Thank you for being part of our story.',
    wishAgain: 'Write another wish',
    wishRequired: 'Write a few words for the couple.',
    wishFailed: 'Your wish was not saved. Keep your words and try again.',
    wishSaved: 'Your private demo wish was saved. Attendance has not changed.',
    previewTitle: 'Imagine this day, your way.',
    previewNote:
      'This preview cannot collect replies or wishes. After order confirmation and dashboard activation, publish your invitation to begin sharing.',
    customize: 'Make this invitation yours',
    closing: 'With love, always',
    closingBn: 'We cannot wait to welcome you.',
    signature: 'AND OUR FAMILIES',
    unavailable: 'This invitation is not here.',
    unavailableNote:
      'Personalized demo links need the browser where the guest was created. The invitation may also be preparing. No shared customer database is connected yet.',
    loading: 'Preparing your little piece of joy…',
  },
  bn: {
    demo: 'কল্পনার একটি আমন্ত্রণ। নাম, ছবি ও স্থান নমুনা।',
    sampleReply: 'RSVP চেষ্টা করুন · নমুনা উত্তর এই ব্রাউজারেই থাকবে, কোনো গ্রাহকের অর্ডারে নয়।',
    preview: 'শুধু ডিজাইন দেখার নমুনা · এখানে উত্তর পাঠানো যাবে না।',
    storageProblem:
      'ব্রাউজার স্টোরেজে সংরক্ষিত নমুনা পাওয়া যায়নি বা স্টোরেজ ব্যবহার করা যাচ্ছে না। আমন্ত্রণ দেখতে পারবেন; উত্তর সংরক্ষিত নাও হতে পারে।',
    collection: 'টেমপ্লেট দেখুন',
    open: 'আমন্ত্রণ খুলুন',
    openQuietly: 'অ্যানিমেশন ছাড়া খুলুন',
    finishOpening: 'এখনই খুলুন',
    addressedTo: 'বিশেষ করে আপনাদের জন্য',
    fromCouple: 'ভালোবাসায় আমন্ত্রণ জানাচ্ছি',
    replyAs: 'যাঁদের পক্ষ থেকে উত্তর',
    personalLinkTitle: 'আপনার আমন্ত্রণ, আপনার উত্তর।',
    personalLinkNote:
      'উত্তর দিতে আমাদের পাঠানো ব্যক্তিগত আমন্ত্রণের লিংকটি খুলুন। সেখানে আপনার নাম ও আমন্ত্রণের বিস্তারিত দেওয়া থাকবে।',
    skip: 'সরাসরি বিস্তারিত দেখুন',
    opening: 'খুলছে ভালোবাসার চিঠি…',
    pauseMotion: 'অ্যানিমেশন থামান',
    resumeMotion: 'অ্যানিমেশন চালু করুন',
    quietMotion: 'আপনার ডিভাইসে কম অ্যানিমেশন চালু আছে',
    playMusic: 'বিয়ের সুর চালু করুন',
    pauseMusic: 'বিয়ের সুর থামান',
    loadingMusic: 'সুর প্রস্তুত হচ্ছে। বাতিল করতে চাপুন।',
    blockedMusic: 'বিয়ের সুর শুনতে মিউজিক বাটনে চাপুন।',
    failedMusic: 'সুর লোড হয়নি। মিউজিক বাটনে চাপ দিয়ে আবার চেষ্টা করতে পারেন।',
    musicCredit: 'সুরের কৃতজ্ঞতা',
    dateChapter: 'যে দিনটি মনে রাখবেন',
    untieDate: 'তারিখের ফিতাটি খুলুন',
    foldDate: 'তারিখের ফিতাটি ভাঁজ করুন',
    dateUnfolded: 'আমাদের বিশেষ দিন',
    edition: 'জামদানি সংস্করণ',
    letter: 'ভালোবাসায় পাঠানো একটি চিঠি।',
    personal: 'এই আমন্ত্রণ, বিশেষ করে আপনাদের জন্য',
    forYou: 'আমাদের প্রিয় মানুষদের জন্য',
    wedding: 'শুরু হচ্ছে একসঙ্গে পথচলা',
    dateTba: 'তারিখ জানানো হবে',
    welcomeLabel: 'দুই পরিবার। এক সুন্দর নতুন শুরু।',
    welcome: 'কিছু আনন্দে',
    welcomeEm: 'আপনজনদের চাই।',
    hosts: 'দুই পরিবারের ভালোবাসায়',
    welcomeNote: 'আমাদের এই দিনে আপনাদের পাশে পেলে আনন্দটা পূর্ণ হবে।',
    scroll: 'খুলে যাক আমাদের গল্প',
    details: 'অনুষ্ঠান',
    pictures: 'আমাদের মুহূর্ত',
    reply: 'আপনার উত্তর',
    anticipation: 'অপেক্ষার প্রতিটি দিন, একটু একটু কাছে',
    countdown: 'দিন গুনছি একসঙ্গে।',
    until: 'পর্যন্ত',
    days: 'দিন',
    hours: 'ঘণ্টা',
    minutes: 'মিনিট',
    seconds: 'সেকেন্ড',
    past: 'দিনটি এখন সুন্দর এক স্মৃতি।',
    dateNote: 'সব সময় বাংলাদেশ সময় অনুযায়ী (UTC+০৬:০০)।',
    programmeLabel: 'আসুন, একসঙ্গে কিছু সুন্দর স্মৃতি তৈরি করি।',
    programme: 'আমাদের আয়োজন।',
    directions: 'গুগল ম্যাপস',
    calendar: 'ক্যালেন্ডারে যোগ করুন',
    address: 'ঠিকানা কপি করুন',
    copied: 'ঠিকানা কপি হয়েছে',
    copyFailed: 'কপি হয়নি। নিচের ঠিকানাটি সিলেক্ট করে কপি করুন।',
    showMap: 'ম্যাপ দেখুন',
    hideMap: 'ম্যাপ লুকান',
    mapLabel: 'এই স্থানের ম্যাপ:',
    mapNote: 'ম্যাপ গুগলের সেবা। না খুললে ঠিকানা বা ম্যাপস লিংক ব্যবহার করুন।',
    photoLabel: 'ছোট ছোট মুহূর্তে, বড় ভালোবাসা',
    photoTitle: 'আমাদের কিছু মুহূর্ত।',
    photoNote: 'আমাদের গল্পের কয়েকটি পাতা।',
    photoCaption: 'ছবিটি বড় করে দেখুন',
    carousel: 'ছবির স্লাইডশো',
    photoSlide: 'ছবি',
    choosePhoto: 'এই ছবিটি দেখুন',
    pausePhotos: 'স্লাইডশো থামান',
    playPhotos: 'স্লাইডশো চালু করুন',
    photoOpen: 'ছবি বড় করে দেখুন',
    close: 'বন্ধ করুন',
    previous: 'আগের ছবি',
    next: 'পরের ছবি',
    photoMissing: 'হৃদয়ে রাখা এক সুন্দর মুহূর্ত।',
    photoFree: 'সব ভালোবাসা ছবিতে ধরে না।',
    photoFreeNote: 'প্রিয় মানুষদের সঙ্গেই লেখা হোক আমাদের নতুন শুরুর গল্প।',
    rsvpLabel: 'আমাদের আয়োজনে আপনার জন্য জায়গা',
    rsvpTitle: 'আমাদের এই দিনে',
    rsvpEm: 'আপনি আসছেন তো?',
    rsvpNote: 'আপনার ছোট্ট উত্তরটুকু আয়োজনের প্রস্তুতিতে অনেক সাহায্য করবে।',
    forEvent: 'কোন অনুষ্ঠানের জন্য উত্তর',
    name: 'আপনার বা পরিবারের নাম',
    nameHint: 'কোন নামে সম্বোধন করব?',
    attend: 'আপনি কি আসতে পারবেন?',
    yes: 'আনন্দের সঙ্গে আসব',
    no: 'আসতে পারব না',
    adults: 'প্রাপ্তবয়স্ক, আপনিসহ',
    children: 'শিশু',
    note: 'আপনার আসার প্রস্তুতিতে কিছু জানা প্রয়োজন?',
    optional: 'ঐচ্ছিক',
    submit: 'উত্তর পাঠান',
    saving: 'উত্তর সংরক্ষণ হচ্ছে…',
    saved: 'ভালোবাসায় পাওয়া আপনার উত্তর।',
    accepted: 'আপনাদের সঙ্গে আনন্দ ভাগ করে নিতে অপেক্ষায় রইলাম।',
    declined: 'দূরে থেকেও আপনি আমাদের আনন্দের অংশ। জানানোর জন্য ধন্যবাদ।',
    edit: 'উত্তর পরিবর্তন করুন',
    people: 'জন',
    allowance: 'প্রতি অনুষ্ঠানে আপনিসহ সর্বোচ্চ অতিথি',
    localSaved: 'নমুনা উত্তর শুধু এই ব্রাউজারেই সংরক্ষিত।',
    privacy: 'আপনার উত্তর বর-কনে ও তাঁদের পরিবারের জন্য। এই নমুনায় শুধু এই ব্রাউজারে সংরক্ষিত হবে।',
    requiredName: 'আপনার নাম লিখুন।',
    requiredWish: 'শুভেচ্ছা পাঠানোর আগে কিছু লিখুন।',
    countsInvalid: 'ইংরেজি বা বাংলা অঙ্কে অতিথির পূর্ণসংখ্যা লিখুন।',
    allowanceInvalid: 'আসার উত্তরে অন্তত একজন থাকতে হবে এবং আমন্ত্রণের সীমা অতিক্রম করা যাবে না।',
    saveFailed: 'উত্তর সংরক্ষিত হয়নি। আপনার লেখা আছে—ব্রাউজার স্টোরেজ পরীক্ষা করে আবার চেষ্টা করুন।',
    closed: 'এই আমন্ত্রণের উত্তর গ্রহণের সময় শেষ হয়েছে।',
    invalidScope: 'এই অনুষ্ঠানটি আপনার আমন্ত্রণে নেই।',
    wishLabel: 'যে কথাগুলো রেখে দিতে চাই',
    wishTitle: 'ভালোবাসার কিছু কথা।',
    wishFor: 'আমাদের নতুন পথচলার জন্য',
    wishNote:
      'আমাদের নতুন পথচলার জন্য দোয়া, প্রিয় কোনো স্মৃতি কিংবা মনের দুটো কথা লিখে রাখুন। এই শুভেচ্ছা আপনার আসা-না-আসার উত্তর থেকে আলাদা।',
    wish: 'বর-কনের উদ্দেশে আপনার বার্তা',
    wishSend: 'শুভেচ্ছা পাঠান',
    wishThanks: 'আমাদের গল্পের অংশ হওয়ার জন্য ভালোবাসা রইল।',
    wishAgain: 'আরেকটি শুভেচ্ছা লিখুন',
    wishRequired: 'বর-কনের জন্য কিছু কথা লিখুন।',
    wishFailed: 'শুভেচ্ছা সংরক্ষিত হয়নি। লেখা রেখে আবার চেষ্টা করুন।',
    wishSaved: 'নমুনা শুভেচ্ছা সংরক্ষিত। অতিথির সংখ্যা বদলায়নি।',
    previewTitle: 'আপনার দিন, আপনার মতো।',
    previewNote:
      'এই ডিজাইন নমুনায় উত্তর বা শুভেচ্ছা সংগ্রহ করা যায় না। অর্ডার নিশ্চিত ও ড্যাশবোর্ড চালু হওয়ার পরে আমন্ত্রণ প্রকাশ করে শেয়ার করতে পারবেন।',
    customize: 'এই আমন্ত্রণ নিজের মতো করুন',
    closing: 'ভালোবাসায়, সবসময়',
    closingBn: 'আপনাদের অপেক্ষায় রইলাম।',
    signature: 'ও আমাদের পরিবারবর্গ',
    unavailable: 'আমন্ত্রণটি এখানে পাওয়া যাচ্ছে না।',
    unavailableNote:
      'ব্যক্তিগত নমুনা লিংক সেই ব্রাউজারেই কাজ করে, যেখানে অতিথি তৈরি করা হয়েছে। আমন্ত্রণের প্রস্তুতিও চলতে পারে। এখনো কোনো অনলাইন গ্রাহক ডেটাবেস যুক্ত নেই।',
    loading: 'সাজানো হচ্ছে আপনার আমন্ত্রণ…',
  },
} satisfies Record<Locale, Record<string, string>>;

export function resolveLocale(explicit: string | null, saved?: string | null): Locale {
  return explicit === 'en' || explicit === 'bn' ? explicit : saved === 'en' ? 'en' : 'bn';
}
export function localNames(invitation: Invitation, locale: Locale) {
  return locale === 'bn'
    ? [
        invitation.partnerOneBn?.trim() || invitation.partnerOne,
        invitation.partnerTwoBn?.trim() || invitation.partnerTwo,
      ]
    : [invitation.partnerOne, invitation.partnerTwo];
}
export function guestText(guest: Guest, locale: Locale) {
  const name = locale === 'bn' ? guest.nameBn?.trim() || guest.name : guest.name;
  return {
    name,
    greeting:
      locale === 'bn' ? guest.greeting.trim() || `প্রিয় ${name}` : guest.greetingEn?.trim() || `Dear ${name}`,
    message: locale === 'en' ? guest.messageEn?.trim() || guest.message : guest.message,
  };
}
export function bilingualIssues(invitation: Invitation): string[] {
  const missing: string[] = [];
  if (!invitation.partnerOneBn?.trim() || !invitation.partnerTwoBn?.trim())
    missing.push('partner names in Bangla');
  if (invitation.hosts.trim() && !invitation.hostsBn?.trim()) missing.push('host wording in Bangla');
  if (!invitation.message.trim() || !invitation.messageEn?.trim())
    missing.push('invitation message in both languages');
  if (
    invitation.events.some(
      (e) => !e.titleBn?.trim() || !e.venueBn?.trim() || (e.address.trim() && !e.addressBn?.trim()),
    )
  )
    missing.push('event titles, venues and addresses in Bangla');
  if (invitation.photos?.some((p) => !p.alt.trim() || !p.altBn?.trim()))
    missing.push('photo descriptions in both languages');
  return missing;
}
export function eventText(event: Invitation['events'][number], locale: Locale) {
  return {
    title: locale === 'bn' ? event.titleBn || event.title : event.title,
    venue: locale === 'bn' ? event.venueBn || event.venue : event.venue,
    address: locale === 'bn' ? event.addressBn || event.address : event.address,
  };
}
export const number = (value: number, locale: Locale, min = 1) =>
  new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
    minimumIntegerDigits: min,
    useGrouping: false,
  }).format(value);
export function eventInstant(event: Pick<Invitation['events'][number], 'date' | 'time'>) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(event.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(event.time)) return null;
  const day = Date.parse(`${event.date}T00:00:00Z`);
  if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== event.date) return null;
  const value = Date.parse(`${event.date}T${event.time}:00+06:00`);
  return Number.isFinite(value) ? value : null;
}
export function formatDate(date: string, locale: Locale) {
  const value = eventInstant({ date, time: '12:00' });
  return value !== null
    ? new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Dhaka',
      }).format(value)
    : words[locale].dateTba;
}
export function formatTime(event: Invitation['events'][number], locale: Locale) {
  const instant = eventInstant(event);
  return instant === null
    ? '—'
    : new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Dhaka',
      }).format(instant);
}
export function countdown(target: number, now: number) {
  const seconds = Math.max(0, Math.floor((target - now) / 1000));
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    past: target <= now,
  };
}
export function parseCount(raw: string) {
  const normalized = raw.trim().replace(/[০-৯]/g, (c) => String(c.charCodeAt(0) - 0x09e6));
  return /^\d{1,3}$/.test(normalized) ? Number(normalized) : null;
}
export function mapUrl(event: Invitation['events'][number], embed = false) {
  const query = encodeURIComponent([event.venue, event.address].filter(Boolean).join(', '));
  return embed
    ? `https://maps.google.com/maps?q=${query}&output=embed`
    : `https://www.google.com/maps/search/?api=1&query=${query}`;
}
export function responseError(
  guest: Guest,
  eventId: string,
  answer: { attendance: 'accepted' | 'declined'; adults: number; children: number },
  invitation: Invitation,
  now = Date.now(),
): 'closed' | 'invalidScope' | 'countsInvalid' | 'allowanceInvalid' | null {
  if (invitation.rsvpClosesAt && Date.parse(invitation.rsvpClosesAt) <= now) return 'closed';
  if (
    !guest.events.includes(eventId as 'nikah' | 'reception') ||
    !invitation.events.some((e) => e.id === eventId)
  )
    return 'invalidScope';
  if (![answer.adults, answer.children].every((n) => Number.isInteger(n) && n >= 0)) return 'countsInvalid';
  const total = answer.adults + answer.children;
  if (answer.attendance === 'accepted' ? total < 1 || total > guest.allowance : total !== 0)
    return 'allowanceInvalid';
  return null;
}
export function saveResponse(
  current: Workspace,
  guest: Guest,
  eventId: string,
  answer: Guest['responses'][string],
  invitation: Invitation,
): Workspace {
  const existing = current.guests.find((g) => g.id === guest.id);
  if (!existing) throw new Error('invalidScope');
  const error = responseError(existing, eventId, answer, invitation);
  if (error) throw new Error(error);
  const next = { ...existing, responses: { ...existing.responses, [eventId]: answer } };
  return {
    ...current,
    guests: current.guests.map((g) => (g.id === guest.id ? next : g)),
  };
}
function icsEscape(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
function foldLine(line: string) {
  const lines: string[] = [];
  let part = '';
  let size = 0;
  for (const char of line) {
    const length = new TextEncoder().encode(char).length;
    if (size + length > 75) {
      lines.push(part);
      part = ' ';
      size = 1;
    }
    part += char;
    size += length;
  }
  lines.push(part);
  return lines.join('\r\n');
}
export function calendarContent(event: Invitation['events'][number], invitation: Invitation, locale: Locale) {
  const start = eventInstant(event);
  if (start === null) throw new Error('Invalid event date');
  const utc = (n: number) =>
    new Date(n)
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}Z$/, 'Z');
  const text = eventText(event, locale);
  let hash = 0;
  for (const char of `${invitation.partnerOne}|${invitation.partnerTwo}`)
    hash = (Math.imul(hash, 31) + char.codePointAt(0)!) | 0;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Dawat//Jamdani Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:dawat-${Math.abs(hash)}-${event.id}@invitation.local`,
    `DTSTAMP:${utc(Date.now())}`,
    `DTSTART:${utc(start)}`,
    `DTEND:${utc(start + 2 * 60 * 60 * 1000)}`,
    `SUMMARY:${icsEscape(`${localNames(invitation, locale).join(' & ')} — ${text.title}`)}`,
    `LOCATION:${icsEscape(`${text.venue}, ${text.address}`)}`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ]
    .map(foldLine)
    .join('\r\n');
}
