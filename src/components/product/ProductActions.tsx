'use client';

import { useLeadDialog } from '@/components/forms/LeadDialog';

export function ProductActions({ productName }: { productName: string }) {
  const { open } = useLeadDialog();

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => open('consult', productName)}
        className="btn-solid flex-1"
      >
        Запросить консультацию
      </button>
      <a
        href="/catalog-a3-foryou.pdf"
        download
        className="btn-outline flex-1"
      >
        Скачать каталог PDF
      </a>
    </div>
  );
}
