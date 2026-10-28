'use client';
import { ProductText, useProductLocale } from './product-locale';
import { BrandLockup } from '../brand-mark';
import s from './workspace.module.css';
export function WorkspaceLoading() {
  const { locale } = useProductLocale();
  return (
    <div className={s.shell}>
      <main className={s.login} aria-busy="true">
        <a href="/dashboard/" className={s.brand}>
          <BrandLockup locale={locale} size={34} />
        </a>
        <div className={s.panel} role="status">
          <p>
            <ProductText en="Loading your workspace…" bn="আপনার আয়োজন লোড হচ্ছে…" />
          </p>
          <p className={s.muted}>
            <ProductText
              en="Checking your access and saved information."
              bn="অ্যাক্সেস ও সংরক্ষিত তথ্য যাচাই করা হচ্ছে।"
            />
          </p>
        </div>
      </main>
    </div>
  );
}
