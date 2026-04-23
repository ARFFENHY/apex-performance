import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProgressLog {
  id: string;
  client_id: string;
  exercise_id: string | null;
  exercise_name: string;
  weight: number | null;
  reps: number | null;
  sets: number | null;
  notes: string | null;
  created_at: string;
}

// Coach viewing a client's progress
export function useClientProgressLogs(clientId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['progress_logs', clientId],
    enabled: !!user && !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_logs')
        .select('*')
        .eq('client_id', clientId!)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return (data || []) as ProgressLog[];
    },
  });
}

// Client logging their own progress
export function useAddProgressLog() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      exercise_id?: string;
      exercise_name: string;
      weight?: number;
      reps?: number;
      sets?: number;
      notes?: string;
    }) => {
      const { error } = await supabase.from('progress_logs').insert({
        client_id: user!.id,
        exercise_id: input.exercise_id || null,
        exercise_name: input.exercise_name,
        weight: input.weight ?? null,
        reps: input.reps ?? null,
        sets: input.sets ?? null,
        notes: input.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['progress_logs'] });
      toast.success('Progreso registrado');
    },
    onError: () => toast.error('Error al registrar progreso'),
  });
}

// Aggregated progress per exercise for charts
export function useExerciseProgressChart(clientId: string | null, exerciseName: string | null) {
  return useQuery({
    queryKey: ['progress_chart', clientId, exerciseName],
    enabled: !!clientId && !!exerciseName,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('progress_logs')
        .select('weight, reps, sets, created_at')
        .eq('client_id', clientId!)
        .eq('exercise_name', exerciseName!)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      return (data || []) as { weight: number | null; reps: number | null; sets: number | null; created_at: string }[];
    },
  });
}
