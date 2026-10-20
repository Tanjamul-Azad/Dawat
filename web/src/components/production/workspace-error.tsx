'use client';
import { WorkspaceFrame } from './frame';
import { ProductText } from './product-locale';
import s from './workspace.module.css';
export default function WorkspaceError({ retry }: { retry: () => void }) {
  return (
    <WorkspaceFrame>
      <section className={s.panel} role="alert">
        <h1>
          <ProductText en="We could not load this workspace." bn="আপনার আয়োজনটি খোলা যায়নি।" />
        </h1>
        <p>
          <ProductText
            en="Your saved information is unchanged. Check your connection and try again."
            bn="সংরক্ষিত তথ্য অক্ষত আছে। সংযোগ যাচাই করে আবার চেষ্টা করুন।"
          />
        </p>
        <div className={s.actions}>
          <button className={s.button} onClick={retry}>
            <ProductText en="Try again" bn="আবার চেষ্টা করুন" />
          </button>
          <a className={s.secondary} href="/dashboard/">
            <ProductText en="My weddings" bn="আমার আয়োজন" />
          </a>
        </div>
      </section>
    </WorkspaceFrame>
  );
}
