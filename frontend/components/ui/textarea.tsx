import * as React from 'react';
import { cn } from '@/lib/utils/cn';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-20 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-day focus-visible:ring-offset-1',
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = 'Textarea';

export { Textarea };
