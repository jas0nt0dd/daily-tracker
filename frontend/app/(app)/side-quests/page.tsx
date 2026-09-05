'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { SideQuestForm } from '@/features/side-quests/SideQuestForm';
import { SideQuestList } from '@/features/side-quests/SideQuestCard';

export default function SideQuestsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Side Quests</h1>

      <Card>
        <CardHeader>
          <CardTitle>New side quest</CardTitle>
        </CardHeader>
        <CardContent>
          <SideQuestForm />
        </CardContent>
      </Card>

      <SideQuestList />
    </div>
  );
}
