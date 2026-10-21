'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { productText } from '@/features/production/copy';
type Locale = 'bn' | 'en';
const Context = createContext({
  locale: 'bn' as Locale,
  setLocale: (_l: Locale) => {},
  tr: (text: string) => productText(text),
});
export function ProductLocale({ children }: { children: React.ReactNode }) {
  const [locale, update] = useState<Locale>('bn');
  useEffect(() => {
    if (document.cookie.split(';').some((c) => c.trim() === 'dawat_ui=en')) update('en');
  }, []);
  const setLocale = useCallback((next: Locale) => {
    update(next);
    document.cookie = `dawat_ui=${next}; Path=/; SameSite=Lax; Max-Age=31536000${location.protocol === 'https:' ? '; Secure' : ''}`;
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <Context.Provider value={{ locale, setLocale, tr: (text) => productText(text, locale) }}>
      {children}
    </Context.Provider>
  );
}
export const useProductLocale = () => useContext(Context);
export function ProductText({ en, bn }: { en: string; bn: string }) {
  const { locale } = useProductLocale();
  return <>{locale === 'bn' ? bn : en}</>;
}
