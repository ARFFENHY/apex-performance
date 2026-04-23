import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WorkoutExercise {
  id?: string;
  exercise_name: string;
  sets: number;
  reps: number;
  weight_kg: number;
  rest_seconds: number;
  sort_order: number;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  log_date: string;
  muscle_groups: string;
  notes: string | null;
  duration_min: number | null;
  created_at: string;
  exercises?: WorkoutExercise[];
}

export function useWorkoutSession(date: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['workout_session', user?.id, date],
    enabled: !!user && !!date,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('log_date', date)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) { console.warn('workout_sessions:', error.message); return null; }
      if (!data) return null;

      const { data: exercises } = await supabase
        .from('workout_session_exercises')
        .select('*')
        .eq('session_id', data.id)
        .order('sort_order', { ascending: true });

      return { ...data, exercises: exercises || [] } as WorkoutSession;
    },
  });
}

export function useSaveWorkoutSession() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      log_date: string;
      muscle_groups: string;
      notes?: string;
      duration_min?: number;
      exercises: WorkoutExercise[];
    }) => {
      // Delete existing session for this date
      const { data: existing } = await supabase
        .from('workout_sessions')
        .select('id')
        .eq('user_id', user!.id)
        .eq('log_date', input.log_date)
        .maybeSingle();

      if (existing) {
        await supabase.from('workout_session_exercises').delete().eq('session_id', existing.id);
        await supabase.from('workout_sessions').delete().eq('id', existing.id);
      }

      // Insert new session
      const { data: session, error } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user!.id,
          log_date: input.log_date,
          muscle_groups: input.muscle_groups,
          notes: input.notes || null,
          duration_min: input.duration_min || null,
        })
        .select('id')
        .single();
      if (error) throw error;

      // Insert exercises
      if (input.exercises.length > 0) {
        const rows = input.exercises.map((ex, i) => ({
          session_id: session.id,
          exercise_name: ex.exercise_name,
          sets: ex.sets,
          reps: ex.reps,
          weight_kg: ex.weight_kg,
          rest_seconds: ex.rest_seconds,
          sort_order: i,
        }));
        const { error: exErr } = await supabase.from('workout_session_exercises').insert(rows);
        if (exErr) throw exErr;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workout_session'] });
      toast.success('Sesión de entrenamiento guardada');
    },
    onError: () => toast.error('Error al guardar sesión'),
  });
}
