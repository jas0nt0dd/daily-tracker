'use client';
import { useState } from 'react';
import { Plus, Compass } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { localDateLabel } from '@/lib/dates/timezone';
import { useSideQuests, useToggleMilestone, useAddMilestone, useUpdateSideQuest } from './api';

const STATUS_VARIANT: Record<string, 'day' | 'success' | 'warning' | 'default'> = {
  planned: 'default', active: 'day', paused: 'warning', completed: 'success', abandoned: 'default',
};

function SideQuestCard({ quest }: { quest: any }) {
  const toggleMilestone = useToggleMilestone();
  const addMilestone = useAddMilestone();
  const updateQuest = useUpdateSideQuest();
  const [newMilestone, setNewMilestone] = useState('');

  const milestones = [...(quest.side_quest_milestones ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const completedCount = milestones.filter((m) => m.completed).length;
  const derivedProgress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : quest.progress_percent;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{quest.title}</CardTitle>
            {quest.target_date && <CardDescription>Target: {localDateLabel(quest.target_date)}</CardDescription>}
          </div>
          <Select value={quest.status} onValueChange={(v) => updateQuest.mutate({ id: quest.id, values: { status: v as any } })}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['planned', 'active', 'paused', 'completed', 'abandoned'].map((s) => (
                <SelectItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {quest.description && <p className="text-sm text-muted">{quest.description}</p>}
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <Badge variant={STATUS_VARIANT[quest.status]}>{quest.status}</Badge>
            <span className="text-muted">{derivedProgress}%</span>
          </div>
          <Progress value={derivedProgress} />
        </div>

        {milestones.length > 0 && (
          <ul className="flex flex-col gap-2">
            {milestones.map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                <Checkbox checked={m.completed} onCheckedChange={(c) => toggleMilestone.mutate({ id: m.id, completed: c })} />
                <span className={`text-sm ${m.completed ? 'text-muted line-through' : ''}`}>{m.title}</span>
                {m.due_date && <span className="ml-auto text-xs text-muted">{localDateLabel(m.due_date)}</span>}
              </li>
            ))}
          </ul>
        )}

        <div className="flex gap-2">
          <Input
            placeholder="Add a milestone"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newMilestone.trim()) {
                addMilestone.mutate({ sideQuestId: quest.id, title: newMilestone.trim() });
                setNewMilestone('');
              }
            }}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (newMilestone.trim()) {
                addMilestone.mutate({ sideQuestId: quest.id, title: newMilestone.trim() });
                setNewMilestone('');
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SideQuestList() {
  const { data: quests, isLoading } = useSideQuests();

  if (isLoading) return <div className="h-40 animate-pulse rounded-md bg-surface-muted" />;
  if (!quests || quests.length === 0) {
    return <EmptyState icon={Compass} title="No side quests yet" description="Create one to start tracking a personal project." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {quests.map((q) => (
        <SideQuestCard key={q.id} quest={q} />
      ))}
    </div>
  );
}
