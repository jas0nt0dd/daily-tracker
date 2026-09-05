'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sideQuestSchema, type SideQuestFormValues } from '@/lib/validation/sideQuest';
import { useAddSideQuest } from './api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';

export function SideQuestForm({ onSuccess }: { onSuccess?: () => void }) {
  const addQuest = useAddSideQuest();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SideQuestFormValues>({
    resolver: zodResolver(sideQuestSchema),
    defaultValues: { status: 'planned', priority: 'medium', progress_percent: 0 },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await addQuest.mutateAsync(values);
      toast({ title: 'Side quest created', variant: 'success' });
      reset({ status: 'planned', priority: 'medium', progress_percent: 0 });
      onSuccess?.();
    } catch {
      toast({ title: 'Could not create side quest', variant: 'error' });
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="e.g. Build a personal website" {...register('title')} />
        {errors.title && <p className="text-xs text-error">{errors.title.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="start_date">Start date</Label>
          <Input id="start_date" type="date" {...register('start_date')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="target_date">Target date</Label>
          <Input id="target_date" type="date" {...register('target_date')} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea id="description" placeholder="What's this about?" {...register('description')} />
      </div>
      <Button type="submit" variant="accent" disabled={isSubmitting} className="mt-1">
        {isSubmitting ? 'Creating...' : 'Create side quest'}
      </Button>
    </form>
  );
}
