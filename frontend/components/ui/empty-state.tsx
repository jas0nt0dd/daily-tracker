import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/** Consistent, useful empty state per the product's UX microcopy rules: explain what's missing and offer a way forward. */
export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center', className)}>
      {Icon && <Icon className="h-8 w-8 text-muted" strokeWidth={1.5} />}
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button variant="accent" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
