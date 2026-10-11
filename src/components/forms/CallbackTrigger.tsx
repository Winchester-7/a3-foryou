'use client';

/** @author Erbol king */

import { useLeadDialog } from './LeadDialog';
import type { LeadKind } from './LeadForm';

export function CallbackTrigger({
  label = 'Заказать звонок',
  kind = 'callback',
  subject,
  className = 'btn-outline',
}: {
  label?: string;
  kind?: LeadKind;
  subject?: string;
  className?: string;
}) {
  const { open } = useLeadDialog();
  return (
    <button type="button" onClick={() => open(kind, subject)} className={className}>
      {label}
    </button>
  );
}
