import type { ReactNode } from 'react';
import { SiteHeader } from './SiteHeader';

export function PageShell({ children, overlay = false }: { children: ReactNode; overlay?: boolean }) {
  return (
    <>
      <SiteHeader overlay={overlay} />
      <main id="main">{children}</main>
    </>
  );
}
