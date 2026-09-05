'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';
import { useRemoveTask } from './api';
import { POSTPONE_REASONS } from '@/lib/validation/task';

export function RemoveTaskDialog({ taskId, open, onOpenChange }: { taskId: string; open: boolean; onOpenChange: (v: boolean) => void }) {
  const removeTask = useRemoveTask();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const finalReason = reason === 'Other' ? customReason : reason;

  const submit = async () => {
    if (!finalReason) {
      toast({ title: 'Please select or enter a reason', variant: 'error' });
      return;
    }
    try {
      await removeTask.mutateAsync({ id: taskId, reason: finalReason });
      toast({ title: 'Task removed' });
      onOpenChange(false);
    } catch {
      toast({ title: 'Could not remove task', variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove task</DialogTitle>
          <DialogDescription>The task stays in your history — it's marked removed, not deleted.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Why remove this?" />
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
          <Button variant="destructive" onClick={submit} disabled={removeTask.isPending}>
            {removeTask.isPending ? 'Saving...' : 'Remove task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
