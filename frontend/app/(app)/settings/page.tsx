'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { ProfileSettings } from '@/features/settings/ProfileSettings';
import { NotificationSettings } from '@/features/settings/NotificationSettings';
import { ExportPanel } from '@/features/settings/ExportPanel';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Timezone and currency affect how every date and amount in the app is displayed.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettings />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export your data</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportPanel />
        </CardContent>
      </Card>
    </div>
  );
}
