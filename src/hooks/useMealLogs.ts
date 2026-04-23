import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MealLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_number: number;
  meal_label: string;
  description: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url: string | null;
  ai_analysis: string | null;
  created_at: string;
}

export function useMealLogs(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['meal_logs', user?.id, date],
    enabled: !!user && !!date,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user!.id)
        .eq('log_date', date)
        .order('meal_number', { ascending: true });
      if (error) { console.warn('meal_logs:', error.message); return []; }
      return (data || []) as MealLog[];
    },
  });
}

export function useSaveMeal() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      log_date: string;
      meal_number: number;
      meal_label: string;
      description?: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      image_url?: string;
      ai_analysis?: string;
    }) => {
      if (input.id) {
        const { error } = await supabase
          .from('meal_logs')
          .update({
            meal_label: input.meal_label,
            description: input.description || null,
            calories: input.calories,
            protein: input.protein,
            carbs: input.carbs,
            fat: input.fat,
            image_url: input.image_url || null,
            ai_analysis: input.ai_analysis || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('meal_logs').insert({
          user_id: user!.id,
          log_date: input.log_date,
          meal_number: input.meal_number,
          meal_label: input.meal_label,
          description: input.description || null,
          calories: input.calories,
          protein: input.protein,
          carbs: input.carbs,
          fat: input.fat,
          image_url: input.image_url || null,
          ai_analysis: input.ai_analysis || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal_logs'] });
      toast.success('Comida guardada');
    },
    onError: () => toast.error('Error al guardar comida'),
  });
}

export function useDeleteMeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('meal_logs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meal_logs'] });
      toast.success('Comida eliminada');
    },
    onError: () => toast.error('Error al eliminar comida'),
  });
}
