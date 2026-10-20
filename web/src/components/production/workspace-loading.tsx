import { ProductText } from './product-locale';
import s from './workspace.module.css';
export function WorkspaceLoading() {
  return (
    <div className={s.shell}>
      <main className={s.login} aria-busy="true">
        <a href="/dashboard/" className={s.brand}>
          দাওয়াত
        </a>
        <div className={s.panel} role="status">
          <p>
            <ProductText en="Loading your workspace…" bn="আপনার আয়োজন লোড হচ্ছে…" />
          </p>
          <p className={s.muted}>
            <ProductText
              en="Checking your access and saved information."
              bn="প্রবেশাধিকার ও সংরক্ষিত তথ্য যাচাই করা হচ্ছে।"
            />
          </p>
        </div>
      </main>
    </div>
  );
}
