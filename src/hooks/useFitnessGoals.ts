import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type GoalType = 'aggressive_loss' | 'definition' | 'maintenance' | 'lean_bulk' | 'bulk';

export interface FitnessGoal {
  id: string;
  user_id: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal_type: GoalType;
  meals_per_day: number;
  weight: number;
  height: number;
  gender: string;
  age: number;
  activity_level: string;
  bmr: number;
  tdee: number;
  is_active: boolean;
  created_at: string;
}

export function useActiveFitnessGoal() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['fitness_goal', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) { console.warn('fitness_goals:', error.message); return null; }
      return data as FitnessGoal | null;
    },
  });
}

export function useFitnessGoalHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['fitness_goal_history', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fitness_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) return [];
      return (data || []) as FitnessGoal[];
    },
  });
}

export function useSaveFitnessGoal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<FitnessGoal, 'id' | 'user_id' | 'is_active' | 'created_at'>) => {
      // Deactivate previous goals
      await supabase
        .from('fitness_goals')
        .update({ is_active: false })
        .eq('user_id', user!.id)
        .eq('is_active', true);

      const { error } = await supabase.from('fitness_goals').insert({
        user_id: user!.id,
        ...input,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fitness_goal'] });
      qc.invalidateQueries({ queryKey: ['fitness_goal_history'] });
      toast.success('Objetivo fitness guardado');
    },
    onError: () => toast.error('Error al guardar objetivo'),
  });
}
