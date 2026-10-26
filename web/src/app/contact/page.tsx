import { ContactPage } from '@/components/storefront-pages';
import { storefrontMetadata } from '@/features/production/share';
export const metadata = {
  ...storefrontMetadata({
    title: 'যোগাযোগ — Dawat',
    description: 'বিয়ের আমন্ত্রণ নিয়ে কথা বলতে হোয়াটসঅ্যাপে দাওয়াতের সাথে যোগাযোগ করুন।',
    path: '/contact/',
  }),
  robots: { index: true, follow: true },
};
export default ContactPage;
