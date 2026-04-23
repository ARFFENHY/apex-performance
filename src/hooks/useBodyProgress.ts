import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface BodyProgressEntry {
  id: string;
  user_id: string;
  weight: number;
  body_fat: number | null;
  muscle_mass: number | null;
  date: string;
  created_at: string;
}

export function useBodyProgress() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['body_progress', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_progress')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: true });

      if (error) throw error;
      return (data || []) as BodyProgressEntry[];
    },
  });
}

export function useAddBodyProgress() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: { weight: number; body_fat?: number; muscle_mass?: number; date: string }) => {
      const { error } = await supabase
        .from('body_progress')
        .insert({
          user_id: user!.id,
          weight: entry.weight,
          body_fat: entry.body_fat ?? null,
          muscle_mass: entry.muscle_mass ?? null,
          date: entry.date,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body_progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}
