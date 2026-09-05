'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, Clock, ListTodo, Menu } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Five most-used destinations on mobile; everything else lives behind "More" -> Settings page nav or a future overflow sheet.
const ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/money', label: 'Money', icon: Wallet },
  { href: '/time', label: 'Time', icon: Clock },
  { href: '/tasks', label: 'Tasks', icon: ListTodo },
  { href: '/settings', label: 'More', icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-surface md:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link key={href} href={href} className={cn('flex flex-col items-center gap-0.5 text-xs', active ? 'text-day' : 'text-muted')}>
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
