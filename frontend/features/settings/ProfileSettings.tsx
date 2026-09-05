'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/toast';

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'UTC'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];

interface FormValues {
  display_name: string;
  timezone: string;
  currency: string;
  daily_sleep_target_minutes: number;
}

export function ProfileSettings() {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const { register, handleSubmit, setValue, reset, watch } = useForm<FormValues>();

  useEffect(() => {
    if (profile) {
      reset({
        display_name: profile.display_name ?? '',
        timezone: profile.timezone,
        currency: profile.currency,
        daily_sleep_target_minutes: profile.daily_sleep_target_minutes,
      });
    }
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateProfile.mutateAsync(values);
      toast({ title: 'Settings saved', variant: 'success' });
    } catch {
      toast({ title: 'Could not save settings', variant: 'error' });
    }
  });

  if (!profile) return <div className="h-48 animate-pulse rounded-md bg-surface-muted" />;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display_name">Display name</Label>
        <Input id="display_name" {...register('display_name')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Timezone</Label>
          <Select value={watch('timezone')} onValueChange={(v) => setValue('timezone', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Currency</Label>
          <Select value={watch('currency')} onValueChange={(v) => setValue('currency', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="daily_sleep_target_minutes">Daily sleep target (minutes)</Label>
        <Input id="daily_sleep_target_minutes" type="number" {...register('daily_sleep_target_minutes')} />
      </div>

      <Button type="submit" variant="accent" disabled={updateProfile.isPending} className="mt-1 self-start">
        {updateProfile.isPending ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  );
}
