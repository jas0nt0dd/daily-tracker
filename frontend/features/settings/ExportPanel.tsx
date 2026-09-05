'use client';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function ExportPanel() {
  const [loading, setLoading] = useState<'csv' | 'json' | null>(null);
  const { toast } = useToast();

  async function exportData(format: 'csv' | 'json') {
    setLoading(format);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(`${API_URL}/api/exports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token ?? ''}` },
        body: JSON.stringify({ format }),
      });
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `daily-life-os-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Export failed', description: 'Check that the backend service is running.', variant: 'error' });
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">Download everything you've logged — expenses, time, sleep, tasks, workouts, side quests, habits, and wellbeing check-ins.</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => exportData('csv')} disabled={loading !== null}>
          <Download className="mr-2 h-4 w-4" /> {loading === 'csv' ? 'Exporting...' : 'Export CSV'}
        </Button>
        <Button variant="outline" onClick={() => exportData('json')} disabled={loading !== null}>
          <Download className="mr-2 h-4 w-4" /> {loading === 'json' ? 'Exporting...' : 'Export JSON'}
        </Button>
      </div>
    </div>
  );
}
