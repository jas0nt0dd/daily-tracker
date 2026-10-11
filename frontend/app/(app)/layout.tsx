import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { QuickAdd } from '@/components/layout/QuickAdd';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) redirect('/login');

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="container flex-1 py-6 pb-28 md:pb-6">{children}</main>
      </div>
      <BottomNav />
      <QuickAdd />
    </div>
  );
}
