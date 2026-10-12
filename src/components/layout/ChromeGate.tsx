'use client';

/** @author Erbol king */
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Public-site chrome (footer, floating buttons) is hidden inside the admin panel. */
export function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;
  return <>{children}</>;
}