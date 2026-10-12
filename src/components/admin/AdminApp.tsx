'use client';

/**
 * Admin shell: navigation + the editor for the selected section.
 * @author Erbol king
 */
import Link from 'next/link';
import type { ReactNode } from 'react';
import { DoorsEditor } from './DoorsEditor';
import { SofasEditor } from './SofasEditor';
import { StockImport } from './StockImport';
import { TilesEditor } from './TilesEditor';
import { LeadsView, PortfolioEditor, PromotionsEditor, SettingsEditor } from './ContentEditors';

const SECTIONS: { id: string; label: string; hint: string }[] = [
  { id: 'tiles', label: 'Керамогранит', hint: 'Коллекции, позиции, остатки, фото' },
  { id: 'stock', label: 'Остатки Excel', hint: 'Загрузить складскую таблицу .xlsx' },
  { id: 'doors', label: 'Двери', hint: 'Межкомнатные и входные' },
  { id: 'sofas', label: 'Диваны', hint: 'Диваны и кресла' },
  { id: 'portfolio', label: 'Портфолио', hint: 'Проекты и интерьеры' },
  { id: 'promotions', label: 'Акции', hint: 'Скидки и предложения' },
  { id: 'leads', label: 'Заявки', hint: 'Обращения с сайта' },
  { id: 'settings', label: 'Контакты', hint: 'Телефон, адрес, часы работы' },
];

const EDITORS: Record<string, () => ReactNode> = {
  tiles: () => <TilesEditor />,
  stock: () => <StockImport />,
  doors: () => <DoorsEditor />,
  sofas: () => <SofasEditor />,
  portfolio: () => <PortfolioEditor />,
  promotions: () => <PromotionsEditor />,
  leads: () => <LeadsView />,
  settings: () => <SettingsEditor />,
};

export function AdminApp({ section }: { section: string | null }) {
  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin';
  };

  const active = section && EDITORS[section] ? section : null;

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link href="/admin" className="text-sm font-semibold text-ink">
            A3 FOR YOU <span className="font-normal text-ink-faint">· управление сайтом</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            {SECTIONS.map((s) => (
              <Link
                key={s.id}
                href={`/admin/${s.id}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active === s.id ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-surface hover:text-ink'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-xs">
            <a href="/" target="_blank" rel="noreferrer" className="text-ink-soft hover:text-ink">
              Открыть сайт ↗
            </a>
            <button type="button" onClick={logout} className="text-accent">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        {active ? (
          EDITORS[active]()
        ) : (
          <div>
            <h1 className="text-2xl font-semibold text-ink">Что хотите изменить?</h1>
            <p className="mt-2 max-w-xl text-sm text-ink-soft">
              Все правки появляются на сайте сразу после нажатия «Сохранить» — пересборка не нужна.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SECTIONS.map((s) => (
                <Link key={s.id} href={`/admin/${s.id}`} className="rounded-2xl border border-line bg-paper p-5 transition-colors hover:border-ink">
                  <span className="block text-base font-semibold text-ink">{s.label}</span>
                  <span className="mt-1 block text-sm text-ink-faint">{s.hint}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
