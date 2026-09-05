'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TaskForm } from '@/features/tasks/TaskForm';
import { TaskList } from '@/features/tasks/TaskList';
import { TomorrowPlanner } from '@/features/tasks/TomorrowPlanner';
import { todayInTimezone } from '@/lib/dates/timezone';

export default function TasksPage() {
  const today = todayInTimezone();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl">Tasks</h1>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="all">All pending</TabsTrigger>
          <TabsTrigger value="plan">Plan tomorrow</TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Add a task</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskForm plannedFor={today} />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Today</CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList plannedFor={today} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All pending tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList status="pending" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <TomorrowPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
}
