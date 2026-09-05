import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { QuickAdd } from '@/components/layout/QuickAdd';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="container flex-1 py-6 pb-24 md:pb-6">{children}</main>
      </div>
      <BottomNav />
      <QuickAdd />
    </div>
  );
}
