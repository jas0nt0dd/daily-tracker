'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Wallet, Clock, Moon, ListTodo, Dumbbell, Compass, ListChecks, HeartPulse, TrendingUp, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/money', label: 'Money', icon: Wallet },
  { href: '/time', label: 'Time', icon: Clock },
  { href: '/sleep', label: 'Sleep', icon: Moon },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/side-quests', label: 'Side Quests', icon: Compass },
  { href: '/habits', label: 'Habits', icon: ListChecks },
  { href: '/wellbeing', label: 'Wellbeing', icon: HeartPulse },
  { href: '/insights', label: 'Insights', icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center px-5">
        <span className="font-display text-lg">Daily Life OS</span>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-day/15 text-day' : 'text-ink/80 hover:bg-surface-muted',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/settings' ? 'bg-day/15 text-day' : 'text-ink/80 hover:bg-surface-muted',
          )}
        >
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </div>
    </aside>
  );
}
