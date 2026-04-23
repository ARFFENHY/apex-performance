import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Program {
  id: string;
  coach_id: string;
  name: string;
  description: string | null;
  created_at: string;
  workout_count?: number;
  is_template?: boolean;
  level?: 'principiante' | 'intermedio' | 'avanzado';
}

export function usePrograms() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['programs', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('programs')
        .select('*, workouts(count)')
        .or(`coach_id.eq.${user!.id},is_template.eq.true`)
        .order('is_template', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((p: any) => ({
        ...p,
        workout_count: p.workouts?.[0]?.count ?? 0,
      })) as Program[];
    },
  });
}

export function useCreateProgram() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { name: string; description?: string }) => {
      const { error } = await supabase
        .from('programs')
        .insert({ coach_id: user!.id, name: input.name, description: input.description || null });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Programa creado');
    },
    onError: () => toast.error('Error al crear programa'),
  });
}

export function useUpdateProgram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: string; name: string; description?: string }) => {
      const { error } = await supabase
        .from('programs')
        .update({ name: input.name, description: input.description || null })
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Programa actualizado');
    },
    onError: () => toast.error('Error al actualizar programa'),
  });
}

export function useDeleteProgram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      toast.success('Programa eliminado');
    },
    onError: () => toast.error('Error al eliminar programa'),
  });
}
