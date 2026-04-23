import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Exercise {
  id: string;
  workout_id: string;
  name: string;
  sets: number;
  reps: number;
  rest_seconds: number;
  order_index: number;
  animation_url: string | null;
  ai_generated: boolean;
  created_at: string;
}

export function useExercises(workoutId: string | null) {
  return useQuery({
    queryKey: ['exercises', workoutId],
    enabled: !!workoutId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', workoutId!)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as Exercise[];
    },
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<Exercise, 'id' | 'created_at'>) => {
      const { error } = await supabase.from('exercises').insert(input);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['exercises', vars.workout_id] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Ejercicio agregado');
    },
    onError: () => toast.error('Error al agregar ejercicio'),
  });
}

export function useUpdateExercise() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; workout_id: string } & Partial<Omit<Exercise, 'id' | 'workout_id' | 'created_at'>>) => {
      const { id, workout_id, ...updates } = input;
      const { error } = await supabase.from('exercises').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['exercises', vars.workout_id] });
      toast.success('Ejercicio actualizado');
    },
    onError: () => toast.error('Error al actualizar ejercicio'),
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; workout_id: string }) => {
      const { error } = await supabase.from('exercises').delete().eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['exercises', vars.workout_id] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Ejercicio eliminado');
    },
    onError: () => toast.error('Error al eliminar ejercicio'),
  });
}
