import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Workout {
  id: string;
  program_id: string;
  name: string;
  day_order: number;
  created_at: string;
  exercise_count?: number;
}

export function useWorkouts(programId: string | null) {
  return useQuery({
    queryKey: ['workouts', programId],
    enabled: !!programId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('*, exercises(count)')
        .eq('program_id', programId!)
        .order('day_order', { ascending: true });

      if (error) throw error;

      return (data || []).map((w: any) => ({
        ...w,
        exercise_count: w.exercises?.[0]?.count ?? 0,
      })) as Workout[];
    },
  });
}

export function useCreateWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { program_id: string; name: string; day_order: number }) => {
      const { error } = await supabase.from('workouts').insert(input);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['workouts', vars.program_id] });
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Rutina creada');
    },
    onError: () => toast.error('Error al crear rutina'),
  });
}

export function useUpdateWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; program_id: string; name: string; day_order: number }) => {
      const { error } = await supabase
        .from('workouts')
        .update({ name: input.name, day_order: input.day_order })
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['workouts', vars.program_id] });
      toast.success('Rutina actualizada');
    },
    onError: () => toast.error('Error al actualizar rutina'),
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; program_id: string }) => {
      const { error } = await supabase.from('workouts').delete().eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['workouts', vars.program_id] });
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Rutina eliminada');
    },
    onError: () => toast.error('Error al eliminar rutina'),
  });
}
