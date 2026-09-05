// Mirrors database/migrations/*.sql. In a real project, regenerate this with:
//   supabase gen types typescript --project-id <id> > types/database.ts
// It is hand-written here to match the migrations exactly.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string | null;
          timezone: string;
          currency: string;
          week_start_day: number;
          sleep_day_boundary: string;
          daily_sleep_target_minutes: number;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
          Relationships: [];
      };
      expense_categories: {
        Row: { id: string; user_id: string; name: string; icon: string | null; is_default: boolean; created_at: string };
        Insert: Partial<Database['public']['Tables']['expense_categories']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['expense_categories']['Row']>;
        Relationships: [];
      };
      time_categories: {
        Row: { id: string; user_id: string; name: string; icon: string | null; is_default: boolean; created_at: string };
        Insert: Partial<Database['public']['Tables']['time_categories']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['time_categories']['Row']>;
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          amount: number;
          currency: string;
          expense_date: string;
          expense_time: string | null;
          merchant: string | null;
          payment_method: string | null;
          description: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['expenses']['Row']> & {
          user_id: string;
          amount: number;
          expense_date: string;
        };
        Update: Partial<Database['public']['Tables']['expenses']['Row']>;
        Relationships: [];
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category_id: string | null;
          amount: number;
          period_type: 'weekly' | 'monthly' | 'yearly';
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['budgets']['Row']> & {
          user_id: string;
          name: string;
          amount: number;
          start_date: string;
        };
        Update: Partial<Database['public']['Tables']['budgets']['Row']>;
        Relationships: [];
      };
      time_entries: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          activity_name: string;
          start_at: string | null;
          end_at: string | null;
          duration_minutes: number;
          entry_date: string;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['time_entries']['Row']> & {
          user_id: string;
          activity_name: string;
          duration_minutes: number;
          entry_date: string;
        };
        Update: Partial<Database['public']['Tables']['time_entries']['Row']>;
        Relationships: [];
      };
      sleep_entries: {
        Row: {
          id: string;
          user_id: string;
          sleep_start: string;
          sleep_end: string;
          duration_minutes: number;
          quality: number | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['sleep_entries']['Row']> & {
          user_id: string;
          sleep_start: string;
          sleep_end: string;
        };
        Update: Partial<Database['public']['Tables']['sleep_entries']['Row']>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_at: string | null;
          priority: 'low' | 'medium' | 'high';
          status: 'pending' | 'in_progress' | 'completed' | 'postponed' | 'removed';
          category: string | null;
          estimated_minutes: number | null;
          reminder_at: string | null;
          completed_at: string | null;
          postponed_until: string | null;
          current_reason: string | null;
          planned_for: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['tasks']['Row']> & { user_id: string; title: string };
        Update: Partial<Database['public']['Tables']['tasks']['Row']>;
        Relationships: [];
      };
      task_events: {
        Row: {
          id: string;
          task_id: string;
          user_id: string;
          event_type: 'created' | 'status_change' | 'postponed' | 'removed' | 'reminder_sent';
          from_status: string | null;
          to_status: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['task_events']['Row']> & { task_id: string; user_id: string; event_type: string };
        Update: Partial<Database['public']['Tables']['task_events']['Row']>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          workout_type: 'gym' | 'running' | 'walking' | 'cycling' | 'sports' | 'home_workout' | 'yoga' | 'mobility' | 'other';
          started_at: string;
          ended_at: string | null;
          duration_minutes: number;
          intensity: 'low' | 'moderate' | 'high' | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['workouts']['Row']> & {
          user_id: string;
          workout_type: string;
          started_at: string;
          duration_minutes: number;
        };
        Update: Partial<Database['public']['Tables']['workouts']['Row']>;
        Relationships: [];
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          user_id: string;
          exercise_name: string;
          sets: number | null;
          reps: number | null;
          weight: number | null;
          distance: number | null;
          duration_seconds: number | null;
          notes: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['workout_exercises']['Row']> & {
          workout_id: string;
          user_id: string;
          exercise_name: string;
        };
        Update: Partial<Database['public']['Tables']['workout_exercises']['Row']>;
        Relationships: [];
      };
      side_quests: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string | null;
          status: 'planned' | 'active' | 'paused' | 'completed' | 'abandoned';
          priority: 'low' | 'medium' | 'high';
          progress_percent: number;
          start_date: string | null;
          target_date: string | null;
          completed_at: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['side_quests']['Row']> & { user_id: string; title: string };
        Update: Partial<Database['public']['Tables']['side_quests']['Row']>;
        Relationships: [];
      };
      side_quest_milestones: {
        Row: {
          id: string;
          side_quest_id: string;
          user_id: string;
          title: string;
          due_date: string | null;
          completed: boolean;
          completed_at: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['side_quest_milestones']['Row']> & {
          side_quest_id: string;
          user_id: string;
          title: string;
        };
        Update: Partial<Database['public']['Tables']['side_quest_milestones']['Row']>;
        Relationships: [];
      };
      side_quest_links: {
        Row: {
          id: string;
          side_quest_id: string;
          user_id: string;
          linked_type: 'time_entry' | 'task' | 'habit';
          linked_id: string;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['side_quest_links']['Row']> & {
          side_quest_id: string;
          user_id: string;
          linked_type: string;
          linked_id: string;
        };
        Update: Partial<Database['public']['Tables']['side_quest_links']['Row']>;
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency_type: 'daily' | 'weekly' | 'custom';
          target_count: number;
          active: boolean;
          start_date: string;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['habits']['Row']> & { user_id: string; name: string };
        Update: Partial<Database['public']['Tables']['habits']['Row']>;
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          log_date: string;
          completed_count: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['habit_logs']['Row']> & {
          habit_id: string;
          user_id: string;
          log_date: string;
        };
        Update: Partial<Database['public']['Tables']['habit_logs']['Row']>;
        Relationships: [];
      };
      wellbeing_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          mood: number | null;
          energy: number | null;
          stress: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['wellbeing_logs']['Row']> & { user_id: string; log_date: string };
        Update: Partial<Database['public']['Tables']['wellbeing_logs']['Row']>;
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          task_reminders_enabled: boolean;
          tomorrow_planning_enabled: boolean;
          habit_reminders_enabled: boolean;
          sleep_reminders_enabled: boolean;
          planned_bedtime: string | null;
          tomorrow_planning_time: string;
          quiet_hours_start: string;
          quiet_hours_end: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notification_preferences']['Row']> & { user_id: string };
        Update: Partial<Database['public']['Tables']['notification_preferences']['Row']>;
        Relationships: [];
      };
      notification_jobs: {
        Row: {
          id: string;
          user_id: string;
          type: 'tomorrow_planning' | 'task_due' | 'task_overdue' | 'habit_reminder' | 'sleep_bedtime';
          reference_id: string | null;
          title: string;
          body: string;
          scheduled_for: string;
          status: 'pending' | 'sent' | 'skipped' | 'failed';
          sent_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database['public']['Tables']['notification_jobs']['Row']> & {
          user_id: string;
          type: string;
          title: string;
          body: string;
          scheduled_for: string;
        };
        Update: Partial<Database['public']['Tables']['notification_jobs']['Row']>;
        Relationships: [];
      };
      export_jobs: {
        Row: {
          id: string;
          user_id: string;
          format: 'csv' | 'json';
          status: 'pending' | 'processing' | 'completed' | 'failed';
          file_path: string | null;
          error_message: string | null;
          requested_at: string;
          completed_at: string | null;
        };
        Insert: Partial<Database['public']['Tables']['export_jobs']['Row']> & { user_id: string; format: string };
        Update: Partial<Database['public']['Tables']['export_jobs']['Row']>;
        Relationships: [];
      };
    };
    Views: {
      daily_expense_summary: { Row: { user_id: string; expense_date: string; expense_count: number; total_amount: number }; Relationships: [] };
      monthly_expense_summary: { Row: { user_id: string; month: string; expense_count: number; total_amount: number; avg_amount: number }; Relationships: [] };
      category_expense_breakdown: { Row: { user_id: string; month: string; category_name: string | null; total_amount: number; expense_count: number }; Relationships: [] };
      daily_time_summary: { Row: { user_id: string; entry_date: string; total_minutes: number; entry_count: number }; Relationships: [] };
      category_time_breakdown: { Row: { user_id: string; entry_date: string; category_name: string | null; total_minutes: number }; Relationships: [] };
      task_completion_summary: { Row: { user_id: string; week_start: string; completed_count: number; postponed_count: number; removed_count: number; total_count: number }; Relationships: [] };
      workout_weekly_summary: { Row: { user_id: string; week_start: string; workout_count: number; total_minutes: number }; Relationships: [] };
      habit_completion_summary: { Row: { user_id: string; habit_id: string; name: string; week_start: string; days_met: number; days_logged: number }; Relationships: [] };
    };
    Functions: {
      get_day_overview: { Args: { p_user_id: string; p_day: string }; Returns: Json };
    };
  };
}
