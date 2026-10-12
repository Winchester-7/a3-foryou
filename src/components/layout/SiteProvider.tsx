'use client';

/** @author Erbol king */
import { createContext, useContext, type ReactNode } from 'react';
import { site as defaults, type SiteInfo } from '@/lib/site';

const Ctx = createContext<SiteInfo>(defaults);

/** Gives client components the current contact details (they are editable in the admin panel). */
export function SiteProvider({ value, children }: { value: SiteInfo; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSite = () => useContext(Ctx);
