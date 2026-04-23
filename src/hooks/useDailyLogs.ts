import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useCheckAchievements } from './useAchievements';

export interface DailyLog {
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
  workout_completed: boolean;
  meals_completed: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useDailyLog(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['daily_log', user?.id, date],
    enabled: !!user && !!date,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user!.id)
        .eq('log_date', date)
        .maybeSingle();
      if (error) { console.warn('daily_logs:', error.message); return null; }
      return data as DailyLog | null;
    },
  });
}

export function useWeeklyLogs() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['weekly_logs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', user!.id)
        .gte('log_date', weekAgo.toISOString().split('T')[0])
        .lte('log_date', today.toISOString().split('T')[0])
        .order('log_date', { ascending: true });
      if (error) return [];
      return (data || []) as DailyLog[];
    },
  });
}

export function useSaveDailyLog() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { checkMilestones } = useCheckAchievements();

  return useMutation({
    mutationFn: async (input: {
      log_date: string;
      calories_consumed: number;
      protein_consumed: number;
      carbs_consumed: number;
      fat_consumed: number;
      water_liters: number;
      workout_completed: boolean;
      meals_completed: boolean;
      notes?: string;
      training_type?: string | null;
      training_duration_min?: number | null;
    }) => {
      const payload: any = {
        user_id: user!.id,
        log_date: input.log_date,
        calories_consumed: input.calories_consumed,
        protein_consumed: input.protein_consumed,
        carbs_consumed: input.carbs_consumed,
        fat_consumed: input.fat_consumed,
        water_liters: input.water_liters,
        workout_completed: input.workout_completed,
        meals_completed: input.meals_completed,
        training_type: input.training_type || null,
        training_duration_min: input.training_duration_min || null,
        notes: input.notes || null,
        updated_at: new Date().toISOString(),
      };

      try {
        const { error } = await supabase.from('daily_logs').upsert(payload, { onConflict: 'user_id,log_date' });
        if (error) throw error;
      } catch (err: any) {
        console.warn('Upsert failed, retrying without completion flags...', err.message);
        // Fallback: remove new columns and retry
        const fallbackPayload = { ...payload };
        delete fallbackPayload.workout_completed;
        delete fallbackPayload.meals_completed;
        delete fallbackPayload.training_type;
        delete fallbackPayload.training_duration_min;
        
        const { error: retryError } = await supabase.from('daily_logs').upsert(fallbackPayload, { onConflict: 'user_id,log_date' });
        if (retryError) throw retryError;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['daily_log'] });
      qc.invalidateQueries({ queryKey: ['weekly_logs'] });
      qc.invalidateQueries({ queryKey: ['training_streak'] });
      toast.success('Registro diario guardado');
      checkMilestones(); // Automatically trigger achievement check
    },
    onError: () => toast.error('Error al guardar registro'),
  });
}

export function useWeightHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['weight_history', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_history')
        .select('*')
        .eq('user_id', user!.id)
        .order('recorded_at', { ascending: true })
        .limit(100);
      if (error) return [];
      return (data || []) as { id: string; user_id: string; weight: number; recorded_at: string }[];
    },
  });
}

export function useSaveWeight() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { checkMilestones } = useCheckAchievements();

  return useMutation({
    mutationFn: async (weight: number) => {
      const { error } = await supabase.from('weight_history').insert({
        user_id: user!.id,
        weight,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['weight_history'] });
      toast.success('Peso registrado');
      checkMilestones(); // Automatically trigger achievement check
    },
    onError: () => toast.error('Error al registrar peso'),
  });
}

