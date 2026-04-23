import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  time: string | null; // HH:mm
  completed: boolean;
  reminder: boolean;
  color: string;
  created_at: string;
}

export const GOAL_COLORS = [
  { key: 'blue', label: 'Azul', value: 'hsl(217, 91%, 60%)' },
  { key: 'green', label: 'Verde', value: 'hsl(160, 84%, 39%)' },
  { key: 'orange', label: 'Naranja', value: 'hsl(32, 95%, 54%)' },
  { key: 'red', label: 'Rojo', value: 'hsl(0, 84%, 60%)' },
  { key: 'purple', label: 'Púrpura', value: 'hsl(270, 70%, 55%)' },
];

export function useGoals(month?: Date) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['goals', user?.id, month?.toISOString()],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user!.id)
        .order('date', { ascending: true });

      if (month) {
        const start = new Date(month.getFullYear(), month.getMonth(), 1);
        const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        query = query
          .gte('date', start.toISOString().split('T')[0])
          .lte('date', end.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('user_goals query failed:', error.message);
        return [] as UserGoal[];
      }

      return (data || []) as UserGoal[];
    },
  });
}

export function useCreateGoal() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: Omit<UserGoal, 'id' | 'user_id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('user_goals')
        .insert({ ...goal, user_id: user!.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: '¡Meta creada!', description: 'Tu meta fue agregada al calendario' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo crear la meta', variant: 'destructive' });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserGoal> & { id: string }) => {
      const { error } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({ title: 'Meta eliminada' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    },
  });
}
