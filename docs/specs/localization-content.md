# Content, localization and wording

Working content specification. All samples are original draft copy. Final brand copy, service promises and religious text need owner review before publication.

## Locale model

User-confirmed scope, 19 October 2026: product UI and template language choices are **Bangla (`bn`) and English (`en`) only**, across storefront, preview, order, client workspace, guest invitation, admin labels and transactional copy. This is an explicit supported-locale boundary, not a plan to add other languages. UI dictionaries are separate from customer-written invitation content. A switch must not translate names automatically or erase edits.

Store `defaultLocale`/`enabledLocales` restricted to `bn`/`en`; both use left-to-right layout. Default new Bangladesh invitations to Bangla. Owners may enable one or both supported languages. A single-language invitation has no dead second-language control. No third-language/RTL interface is included. Optional reviewed blessing wording uses the supported languages; do not invent a verse/translation. Names remain user data and are not transliterated or rejected simply for their script.

Resolve locale from valid explicit selection, then wedding-scoped preference, wedding default, then Bangla. Unsupported display selections fall back; API/manifest writes with unsupported keys fail validation. Require both versions of bilingual required wording or explicit owner-reviewed same-text fallback. Switching preserves scene/scroll, event/form values and response identity without replaying the opening. See [template acceptance](template-experience-quality.md), especially TE01–TE12.

Format dates/times/counts through locale-aware utilities. Keep actual timestamps/timezones in storage. Example display must include the event year and enough date/time information to prevent ambiguity. Use Asia/Dhaka as the default, not the server computer's timezone. Bengali calendar conversion is not a launch requirement.

## Product copy starters

| Context | Bangla | English |
|---|---|---|
| Hero | দাওয়াত হোক আপনাদের গল্পের মতো। | An invitation that feels like your celebration. |
| Explanation | থিম বেছে নিন, অনুষ্ঠানের তথ্য দিন, একটি লিংকে দাওয়াত পাঠান। | Choose a theme, add your events and share one invitation link. |
| Primary discovery | থিম দেখুন | Explore themes |
| Start | এই থিমে শুরু করুন | Start with this theme |
| Demo | নমুনা আমন্ত্রণ দেখুন | Try the invitation demo |
| Assistance | ডিজাইনে সাহায্য নিন | Get design assistance |
| No photos | ছবি ছাড়াই তৈরি করুন | Create without photos |
| Opening | আমন্ত্রণ খুলুন | Open invitation |
| Skip | সরাসরি বিস্তারিত দেখুন | View details |
| Directions | যাওয়ার পথ দেখুন | Get directions |
| Calendar | ক্যালেন্ডারে যোগ করুন | Add to calendar |

## Invitation wording starters

Neutral Bangla: “আমাদের জীবনের নতুন অধ্যায়ের আনন্দ ভাগ করে নিতে আপনাকে সাদর আমন্ত্রণ। আপনার উপস্থিতি আমাদের আয়োজনকে পূর্ণ করবে।”

Family-hosted Bangla: “পরিবারের পক্ষ থেকে আপনাকে আমাদের শুভ আয়োজনে সাদর আমন্ত্রণ জানাচ্ছি।” Follow with owner-entered names/event wording; do not assume which side is hosting.

Neutral English: “Together with our families, we invite you to celebrate the beginning of our next chapter. We would be delighted to have you with us.”

Religious opener: optional user-selected reviewed wording. Do not auto-generate or quote a verse without checking the requested text. Templates must also work with a neutral opener and without portraits/music.

## RSVP wording

| Field/state | Bangla | English |
|---|---|---|
| Name | আপনার নাম | Your name |
| Attendance | আপনি কি আসতে পারবেন? | Will you attend? |
| Accept | আসতে পারব | I'll attend |
| Decline | আসতে পারব না | I can't attend |
| Adults | মোট প্রাপ্তবয়স্ক (আপনিসহ) | Adults, including you |
| Children | শিশু | Children |
| Private note | আয়োজকদের জন্য ব্যক্তিগত বার্তা | Private note for the hosts |
| Submit | উত্তর পাঠান | Send response |
| Confirmed | আপনার উত্তর সংরক্ষিত হয়েছে। | Your response has been saved. |
| Edit | উত্তর পরিবর্তন করুন | Edit response |
| Closed | এই অনুষ্ঠানের RSVP গ্রহণ শেষ হয়েছে। | Responses for this event are closed. |
| Household allowance | এই আমন্ত্রণে সর্বোচ্চ {count} জনের জন্য স্থান রাখা হয়েছে। | This invitation allows up to {count} attendees. |

Pluralization/count formatting should be dictionary-driven. Do not append “guests” to a number whose meaning is unclear; adults/children and total must agree.

## Save/payment/error copy

| State | Recommended message meaning |
|---|---|
| Dirty | Changes not yet saved |
| Saving | Saving changes… |
| Saved | Saved to your account at {time} |
| Local-only | Saved on this device; sign in to keep it in your account |
| Offline | Connection lost; your current edits are still here. Retry saving. |
| Conflict | This draft changed elsewhere. Review the newer version before saving. |
| Required field | Enter {field}; direct focus/link to the field |
| Image rejected | Explain supported type/size and how to choose another image |
| Pending payment | Payment confirmation is pending. Keep your order reference; do not pay again yet. |
| Verified payment | Payment verified; order confirmation and dashboard activation are separate. Do not imply publishing is already available |
| Failed payment | Payment was not completed; show safe retry/order actions |
| Publish failure | Your previous invitation remains live; fix the listed issue and retry |
| RSVP network failure | Response not confirmed yet; retain values and offer retry |
| Invalid guest link | This invitation link is unavailable. Contact the host if needed. |

Translate these messages consistently; do not expose developer errors in either language.

## Forms and public data

Every field has a persistent label, helper where useful, optional/required state, validation limit and privacy intent. Distinguish account contact from public host contact. A family phone number must not become public merely because it was used for order support.

## Personalized invitation and honest prototype copy

| Context | Bangla | English |
|---|---|---|
| Named greeting fallback | প্রিয় {name}, | Dear {name}, |
| General sharing | সাধারণ আমন্ত্রণ লিংক | General invitation link |
| Named sharing | অতিথির নামে আমন্ত্রণ | Personalized guest invitation |
| Guest preview | এই অতিথির আমন্ত্রণ দেখুন | Preview this guest's invitation |
| Personal message privacy | এই বার্তাটি আমন্ত্রণে দেখা যাবে। | This message is shown on this invitation. |
| Recopy | আমন্ত্রণ লিংক কপি করুন | Copy invitation link |
| Rotate explanation | নতুন লিংক তৈরি করলে আগের লিংক কাজ করবে না। | Replacing this link will disable the previous one. |
| Pending | এখনো উত্তর পাওয়া যায়নি | No response yet |
| Demo-only | নমুনা: এই ডিভাইসেই তথ্য সংরক্ষিত হচ্ছে। | Demo: data is saved on this device only. |
| Service not connected | এই নমুনায় অনলাইন সেবাটি যুক্ত করা হয়নি। | This online service is not connected in the demo. |

Greeting/message locale fallbacks are explicit and names never translated. Proposed personal-message maximum is 500 Unicode characters/locale; count shaped text safely and show a useful remaining limit. Host-to-guest personal message is not a private guest-to-host note. A copied personalized link can be forwarded, so never promise it is visible only to the named human. “Unlimited invitation” is not our package wording; describe actual sharing, hosting and usage limits.

Premium copy stays warm and specific, without fake urgency, invented ratings or exaggerated guarantees. Use original desi names/venues marked fictional for demos, not reference customers. Body labels and Bengali numerals must remain readable; decorative letter spacing and per-character animations must not break Bangla shaping.

## Marketing/service policy content checklist

Before launch write actual package inclusions, hosting duration, editing limits, assistance turnaround start condition, revision-round definition, payment verification process, support channel, expiry/export behavior, privacy/retention and refund/cancellation policy. These are business-policy requirements, not a claim that foreign competitor terms apply locally.

Use real customer testimonials only with permission and accurate attribution. Do not copy public names/photos/reviews from the reference sites. Avoid “unlimited,” “instant,” “forever” or guaranteed availability unless the implemented service and policy support it.

## Transactional communication templates

Prepare localized messages for OTP (provider-owned auth template), payment pending/confirmed, publish ready, assistance request received, proof ready, revision received, hosting nearing expiry and support resolution. Messages should reference the right wedding/order and a safe account link. Do not include raw guest tokens, private notes or full guest lists in routine emails.

Sending those messages is application implementation scope; this planning task has not sent any communication.

Complete both-language labels/error/loading/status/accessibility dictionaries before claiming implementation. Local v3 now implements these for the **guest template**, with a state-preserving switch and tested Bangla count parsing; the rest of the storefront/editor/admin still needs full localization. [Implementation evidence and limits](../build-evidence/first-template-v3.md). IDs/tokens and stored instants remain locale-independent.

## Content review fixtures

Long Bangla names with conjuncts; mixed Latin/Bangla names; absent parents; alternative host relationship; three events/venues; long landmark; translated strings wider than English; numbers in selected display locale; no photographs/music; neutral vs optional religious wording; name and notes containing punctuation/HTML-like characters; accepted/declined/closed RSVP.
