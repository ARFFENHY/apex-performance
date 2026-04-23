import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ClientWorkout {
  id: string;
  client_id: string;
  program_id: string;
  coach_id: string;
  start_date: string;
  status: 'activo' | 'pausado' | 'completado';
  notes: string | null;
  created_at: string;
  program_name?: string;
}

export function useClientWorkouts(clientId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client_workouts', clientId || 'all', user?.id],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from('client_workouts')
        .select('*, programs(name)')
        .eq('coach_id', user!.id)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((cw: any) => ({
        ...cw,
        program_name: cw.programs?.name || 'Programa eliminado',
      })) as ClientWorkout[];
    },
  });
}

export function useAssignProgram() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      clientIds: string[];
      programId: string;
      startDate?: string;
      notes?: string;
    }) => {
      const rows = input.clientIds.map((clientId) => ({
        client_id: clientId,
        program_id: input.programId,
        coach_id: user!.id,
        start_date: input.startDate || new Date().toISOString().split('T')[0],
        notes: input.notes || null,
      }));

      const { error } = await supabase
        .from('client_workouts')
        .upsert(rows, { onConflict: 'client_id,program_id' });
      if (error) throw error;

      // Send notifications
      const { data: program } = await supabase
        .from('programs')
        .select('name')
        .eq('id', input.programId)
        .single();

      const notifications = input.clientIds.map((clientId) => ({
        user_id: clientId,
        type: 'program_assigned',
        title: 'Nuevo programa asignado',
        body: `Tu coach te ha asignado el programa "${program?.name || 'nuevo'}"`,
        data: { program_id: input.programId },
      }));

      await supabase.from('notifications').insert(notifications);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_workouts'] });
      toast.success('Programa asignado correctamente');
    },
    onError: () => toast.error('Error al asignar programa'),
  });
}

export function useUpdateAssignmentStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'activo' | 'pausado' | 'completado' }) => {
      const { error } = await supabase
        .from('client_workouts')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_workouts'] });
      toast.success('Estado actualizado');
    },
    onError: () => toast.error('Error al actualizar estado'),
  });
}

export function useUnassignProgram() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_workouts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['client_workouts'] });
      toast.success('Programa desasignado');
    },
    onError: () => toast.error('Error al desasignar'),
  });
}
