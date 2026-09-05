'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { usePostponeTask } from './api';
import { POSTPONE_REASONS } from '@/lib/validation/task';
import { addDaysIso, todayInTimezone } from '@/lib/dates/timezone';

export function PostponeDialog({ taskId, open, onOpenChange }: { taskId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const postpone = usePostponeTask();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [newDate, setNewDate] = useState(addDaysIso(todayInTimezone(), 1));

  const finalReason = reason === 'Other' ? customReason : reason;

  const submit = async () => {
    if (!finalReason) {
      toast({ title: 'Please select or enter a reason', variant: 'error' });
      return;
    }
    try {
      await postpone.mutateAsync({ id: taskId, newDueDate: newDate, reason: finalReason });
      toast({ title: 'Task postponed', variant: 'success' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Could not postpone task', variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Postpone task</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new_due_date">New due date</Label>
            <Input id="new_due_date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Why postpone this?" />
              </SelectTrigger>
              <SelectContent>
                {POSTPONE_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {reason === 'Other' && (
              <Input placeholder="Describe the reason" value={customReason} onChange={(e) => setCustomReason(e.target.value)} />
            )}
          </div>
          <Button variant="accent" onClick={submit} disabled={postpone.isPending}>
            {postpone.isPending ? 'Saving...' : 'Postpone task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
