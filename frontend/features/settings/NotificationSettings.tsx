'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useUser } from '@/hooks/useUser';
import { callBackend } from '@/lib/api/backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/toast';

interface Prefs {
  task_reminders_enabled: boolean;
  tomorrow_planning_enabled: boolean;
  habit_reminders_enabled: boolean;
  sleep_reminders_enabled: boolean;
  tomorrow_planning_time: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

function usePreferences() {
  const { user } = useUser();
  const supabase = createClient();

  return useQuery({
    queryKey: ['notification_preferences', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('notification_preferences').select('*').eq('user_id', user!.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function NotificationSettings() {
  const { data: prefs } = usePreferences();
  const { user } = useUser();
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, watch, reset } = useForm<Prefs>();

  useEffect(() => {
    if (prefs) {
      reset({
        task_reminders_enabled: prefs.task_reminders_enabled,
        tomorrow_planning_enabled: prefs.tomorrow_planning_enabled,
        habit_reminders_enabled: prefs.habit_reminders_enabled,
        sleep_reminders_enabled: prefs.sleep_reminders_enabled,
        tomorrow_planning_time: prefs.tomorrow_planning_time,
        quiet_hours_start: prefs.quiet_hours_start,
        quiet_hours_end: prefs.quiet_hours_end,
      });
    }
  }, [prefs, reset]);

  const save = useMutation({
    mutationFn: async (values: Prefs) => {
      const { error } = await supabase.from('notification_preferences').update(values).eq('user_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification_preferences'] });
      toast({ title: 'Notification settings saved', variant: 'success' });
    },
    onError: () => toast({ title: 'Could not save settings', variant: 'error' }),
  });

  const sendTest = useMutation({
    mutationFn: () => callBackend('/api/notifications/test', { method: 'POST' }),
    onSuccess: () => toast({ title: 'Test notification queued and processed' }),
    onError: () => toast({ title: 'Could not send test notification', variant: 'error' }),
  });

  if (!prefs) return <div className="h-48 animate-pulse rounded-md bg-surface-muted" />;

  const onSubmit = handleSubmit((values) => save.mutate(values));
  const values = watch();

  const toggles: { key: keyof Prefs; label: string }[] = [
    { key: 'tomorrow_planning_enabled', label: 'Remind me to plan tomorrow' },
    { key: 'task_reminders_enabled', label: 'Task due/overdue reminders' },
    { key: 'habit_reminders_enabled', label: 'Habit reminders' },
    { key: 'sleep_reminders_enabled', label: 'Bedtime reminders' },
  ];

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {toggles.map((t) => (
        <label key={t.key} className="flex items-center gap-3 text-sm">
          <Checkbox checked={!!values[t.key]} onCheckedChange={(v) => setValue(t.key, v as any)} />
          {t.label}
        </label>
      ))}

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tomorrow_planning_time">Plan-tomorrow time</Label>
          <Input id="tomorrow_planning_time" type="time" {...register('tomorrow_planning_time')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quiet_hours_start">Quiet hours start</Label>
          <Input id="quiet_hours_start" type="time" {...register('quiet_hours_start')} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="quiet_hours_end">Quiet hours end</Label>
          <Input id="quiet_hours_end" type="time" {...register('quiet_hours_end')} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" variant="accent" disabled={save.isPending}>
          {save.isPending ? 'Saving...' : 'Save preferences'}
        </Button>
        <Button type="button" variant="outline" onClick={() => sendTest.mutate()} disabled={sendTest.isPending}>
          {sendTest.isPending ? 'Sending...' : 'Send test notification'}
        </Button>
      </div>
    </form>
  );
}
