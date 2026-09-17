import Link from 'next/link';
import { PageShell } from '@/components/layout/PageShell';

export default function NotFound() {
  return (
    <PageShell>
      <div className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-[var(--header-h)] text-center">
        <p className="text-[11px] uppercase tracking-brand text-ink-faint">Ошибка 404</p>
        <h1 className="h-display mt-4">Страница не найдена</h1>
        <p className="mt-4 max-w-md text-sm text-ink-soft">
          Возможно, коллекция была перемещена или снята с производства. Вернитесь в каталог, чтобы выбрать актуальную поверхность.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href="/" className="btn-solid">
            На главную
          </Link>
          <Link href="/catalog" className="btn-outline">
            В каталог
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
