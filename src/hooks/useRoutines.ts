import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface RoutineExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  order_index: number;
  notes: string | null;
  muscle_group: string | null;
}

export interface Routine {
  id: string;
  name: string;
  description: string | null;
  category: string;
  duration_minutes: number;
  video_url: string | null;
  created_at: string;
  exercises: RoutineExercise[];
  client_count?: number;
}

export function useRoutines() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['routines', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routines')
        .select(`
          id, name, description, category, duration_minutes, video_url, created_at,
          routine_exercises ( id, name, sets, reps, rest_seconds, order_index, notes, muscle_group )
        `)
        .eq('coach_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r) => ({
        ...r,
        exercises: (r.routine_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index),
        client_count: 0,
      })) as Routine[];
    },
  });
}

export function useCreateRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string; category: string; duration_minutes: number; video_url?: string }) => {
      const { error } = await supabase
        .from('routines')
        .insert({ ...data, coach_id: user!.id, video_url: data.video_url || null });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; description?: string; category: string; duration_minutes: number; video_url?: string | null }) => {
      const { error } = await supabase
        .from('routines')
        .update({
          name: data.name,
          description: data.description || null,
          category: data.category,
          duration_minutes: data.duration_minutes,
          video_url: data.video_url ?? null,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routines'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}
