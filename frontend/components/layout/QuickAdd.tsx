'use client';
import { useState } from 'react';
import { Plus, Wallet, Clock, Moon, ListTodo, Dumbbell, HeartPulse } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ExpenseForm } from '@/features/money/ExpenseForm';
import { TimeEntryForm } from '@/features/time/TimeEntryForm';
import { SleepEntryForm } from '@/features/sleep/SleepEntryForm';
import { TaskForm } from '@/features/tasks/TaskForm';
import { WorkoutForm } from '@/features/workouts/WorkoutForm';
import { MoodCheckin } from '@/features/wellbeing/MoodCheckin';
import { cn } from '@/lib/utils/cn';

type QuickAddType = 'expense' | 'time' | 'sleep' | 'task' | 'workout' | 'wellbeing' | null;

const OPTIONS: { type: Exclude<QuickAddType, null>; label: string; icon: typeof Wallet }[] = [
  { type: 'expense', label: 'Expense', icon: Wallet },
  { type: 'time', label: 'Time', icon: Clock },
  { type: 'task', label: 'Task', icon: ListTodo },
  { type: 'sleep', label: 'Sleep', icon: Moon },
  { type: 'workout', label: 'Workout', icon: Dumbbell },
  { type: 'wellbeing', label: 'Check-in', icon: HeartPulse },
];

export function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<QuickAddType>(null);

  function close() {
    setOpen(false);
    setActive(null);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Quick add"
        className="fixed bottom-20 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-day text-day-foreground shadow-card transition-transform hover:scale-105 md:bottom-6"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto md:left-1/2 md:right-auto md:w-full md:max-w-md md:-translate-x-1/2 md:rounded-lg">
          {!active ? (
            <>
              <SheetHeader>
                <SheetTitle>Quick add</SheetTitle>
              </SheetHeader>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {OPTIONS.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setActive(type)}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-sm font-medium transition-colors hover:bg-surface-muted',
                    )}
                  >
                    <Icon className="h-5 w-5 text-day" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <SheetHeader>
                <SheetTitle>Add {OPTIONS.find((o) => o.type === active)?.label.toLowerCase()}</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                {active === 'expense' && <ExpenseForm onSuccess={close} />}
                {active === 'time' && <TimeEntryForm onSuccess={close} />}
                {active === 'sleep' && <SleepEntryForm onSuccess={close} />}
                {active === 'task' && <TaskForm onSuccess={close} />}
                {active === 'workout' && <WorkoutForm onSuccess={close} />}
                {active === 'wellbeing' && <MoodCheckin />}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
