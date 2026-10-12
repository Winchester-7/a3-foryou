/** @author Erbol king */
import type { Metadata } from 'next';
import { AdminApp } from '@/components/admin/AdminApp';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { adminEnabled, isAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Управление сайтом',
  robots: { index: false, follow: false },
};

export default function AdminPage({ params }: { params: { section?: string[] } }) {
  if (!isAdmin()) return <AdminLogin enabled={adminEnabled()} />;
  return <AdminApp section={params.section?.[0] ?? null} />;
}
