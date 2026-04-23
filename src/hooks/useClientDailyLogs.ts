import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface ClientDailyLog {
  id: string;
  user_id: string;
  log_date: string;
  calories_consumed: number;
  protein_consumed: number;
  carbs_consumed: number;
  fat_consumed: number;
  water_liters: number;
  training_type: string | null;
  training_duration_min: number | null;
  notes: string | null;
  created_at: string;
}

export interface ClientWeightEntry {
  id: string;
  user_id: string;
  weight: number;
  recorded_at: string;
}

export function useClientDailyLogs(clientId: string | null) {
  return useQuery({
    queryKey: ['client_daily_logs', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', clientId!)
        .order('log_date', { ascending: false })
        .limit(30);
      if (error) { console.warn('client daily_logs:', error.message); return []; }
      return (data || []) as ClientDailyLog[];
    },
  });
}

export function useClientWeeklyLogs(clientId: string | null) {
  return useQuery({
    queryKey: ['client_weekly_logs', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', clientId!)
        .gte('log_date', weekAgo.toISOString().split('T')[0])
        .lte('log_date', today.toISOString().split('T')[0])
        .order('log_date', { ascending: true });
      if (error) return [];
      return (data || []) as ClientDailyLog[];
    },
  });
}

export function useClientWeightHistory(clientId: string | null) {
  return useQuery({
    queryKey: ['client_weight_history', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', clientId!)
        .order('recorded_at', { ascending: true })
        .limit(100);
      if (error) return [];
      return (data || []) as ClientWeightEntry[];
    },
  });
}

export function useClientFitnessGoal(clientId: string | null) {
  return useQuery({
    queryKey: ['client_fitness_goal', clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', clientId!)
        .eq('is_active', true)
        .maybeSingle();
      if (error) { console.warn('client fitness_goals:', error.message); return null; }
      return data;
    },
  });
}
