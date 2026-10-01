export type FrequencyType = 'daily' | 'weekdays' | 'weekly_target';
export type TaskPriority = 'low' | 'medium' | 'high';

export type Profile = {
  id: string;
  email: string;
  timezone: string;
  created_at: string;
};

export type UserSettings = {
  user_id: string;
  reminder_times: string[];
  email_enabled: boolean;
  morning_email: boolean;
  weekly_summary: boolean;
  rollover_tasks: boolean;
  created_at: string;
  updated_at: string;
};

export type Habit = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  color: string;
  frequency_type: FrequencyType;
  days_of_week: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  target_per_week: number;
  archived: boolean;
  created_at: string;
};

export type HabitLog = {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD
  completed_at: string;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  due_date: string; // YYYY-MM-DD
  due_time: string | null; // HH:mm
  priority: TaskPriority;
  done: boolean;
  done_at: string | null;
  created_at: string;
};

export type ReminderLog = {
  id: string;
  user_id: string;
  local_date: string; // YYYY-MM-DD
  slot: string;
  sent_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          timezone?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          reminder_times: string[];
          email_enabled: boolean;
          morning_email: boolean;
          weekly_summary: boolean;
          rollover_tasks: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          reminder_times?: string[];
          email_enabled?: boolean;
          morning_email?: boolean;
          weekly_summary?: boolean;
          rollover_tasks?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          reminder_times?: string[];
          email_enabled?: boolean;
          morning_email?: boolean;
          weekly_summary?: boolean;
          rollover_tasks?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          category: string;
          color: string;
          frequency_type: FrequencyType;
          days_of_week: number[];
          target_per_week: number;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          category?: string;
          color?: string;
          frequency_type: FrequencyType;
          days_of_week?: number[];
          target_per_week?: number;
          archived?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          category?: string;
          color?: string;
          frequency_type?: FrequencyType;
          days_of_week?: number[];
          target_per_week?: number;
          archived?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          log_date: string;
          completed_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          log_date: string;
          completed_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          log_date?: string;
          completed_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          due_date: string;
          due_time: string | null;
          priority: TaskPriority;
          done: boolean;
          done_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          due_date: string;
          due_time?: string | null;
          priority?: TaskPriority;
          done?: boolean;
          done_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          due_date?: string;
          due_time?: string | null;
          priority?: TaskPriority;
          done?: boolean;
          done_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      reminder_log: {
        Row: {
          id: string;
          user_id: string;
          local_date: string;
          slot: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          local_date: string;
          slot: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          local_date?: string;
          slot?: string;
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      frequency_type: FrequencyType;
      task_priority: TaskPriority;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
