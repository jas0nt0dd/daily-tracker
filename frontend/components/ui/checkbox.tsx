'use client';
import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => (
    <label className={cn('relative inline-flex h-5 w-5 cursor-pointer items-center justify-center', className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="peer sr-only"
        {...props}
      />
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-sm border border-border bg-surface transition-colors',
          'peer-checked:border-day peer-checked:bg-day peer-focus-visible:ring-2 peer-focus-visible:ring-day peer-focus-visible:ring-offset-1',
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 text-day-foreground" />}
      </span>
    </label>
  ),
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
