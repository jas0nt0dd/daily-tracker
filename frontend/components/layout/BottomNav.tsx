'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Wallet, Clock, Moon, ListTodo, Dumbbell, Compass, ListChecks, HeartPulse, TrendingUp, Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/money', label: 'Money', icon: Wallet },
  { href: '/time', label: 'Time', icon: Clock },
  { href: '/sleep', label: 'Sleep', icon: Moon },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/workouts', label: 'Workouts', icon: Dumbbell },
  { href: '/side-quests', label: 'Quests', icon: Compass },
  { href: '/habits', label: 'Habits', icon: ListChecks },
  { href: '/wellbeing', label: 'Wellbeing', icon: HeartPulse },
  { href: '/insights', label: 'Insights', icon: TrendingUp },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[4.5rem] items-center gap-1 overflow-x-auto border-t border-border bg-surface px-2 md:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} className={cn('flex min-w-[4.25rem] shrink-0 flex-col items-center gap-0.5 px-1 text-[0.65rem]', active ? 'text-day' : 'text-muted')}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
