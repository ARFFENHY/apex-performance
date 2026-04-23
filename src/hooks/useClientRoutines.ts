import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Routine } from './useRoutines';

export interface ClientRoutine {
  id: string;
  routine_id: string;
  client_id: string;
  coach_id: string;
  notes: string | null;
  assigned_at: string;
}

// Get all assignments for a specific routine
export function useRoutineAssignments(routineId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['routine_assignments', routineId],
    enabled: !!user && !!routineId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_routines')
        .select('id, routine_id, client_id, coach_id, notes, assigned_at')
        .eq('routine_id', routineId!)
        .eq('coach_id', user!.id);
      if (error) throw error;
      return (data || []) as ClientRoutine[];
    },
  });
}

// Assign routine to client(s)
export function useAssignRoutine() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routineId, clientIds, notes }: { routineId: string; clientIds: string[]; notes?: string }) => {
      const rows = clientIds.map((clientId) => ({
        routine_id: routineId,
        client_id: clientId,
        coach_id: user!.id,
        notes: notes || null,
      }));

      const { error } = await supabase.from('client_routines').upsert(rows, { onConflict: 'routine_id,client_id' });
      if (error) throw error;

      // Send notifications to clients
      const { data: routine } = await supabase
        .from('routines')
        .select('name')
        .eq('id', routineId)
        .single();

      const notifications = clientIds.map((clientId) => ({
        user_id: clientId,
        type: 'routine_assigned',
        title: 'Nueva rutina asignada',
        body: `Tu coach te ha asignado la rutina "${routine?.name || 'nueva'}"`,
        data: { routine_id: routineId },
      }));

      await supabase.from('notifications').insert(notifications);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine_assignments'] });
      queryClient.invalidateQueries({ queryKey: ['routines'] });
    },
  });
}

// Unassign routine from client
export function useUnassignRoutine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routineId, clientId }: { routineId: string; clientId: string }) => {
      const { error } = await supabase
        .from('client_routines')
        .delete()
        .eq('routine_id', routineId)
        .eq('client_id', clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routine_assignments'] });
    },
  });
}

// Favorites
export function useFavoriteRoutines() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['favorite_routines', user?.id],
    enabled: !!user,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('favorite_routines')
          .select('routine_id')
          .eq('user_id', user!.id);
        if (error) {
          // Table might not exist yet — return empty set silently
          if (error.code === 'PGRST205' || error.message?.includes('Could not find')) {
            return new Set<string>();
          }
          throw error;
        }
        return new Set((data || []).map((f) => f.routine_id));
      } catch {
        return new Set<string>();
      }
    },
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ routineId, isFavorite }: { routineId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorite_routines')
          .delete()
          .eq('routine_id', routineId)
          .eq('user_id', user!.id);
        if (error && error.code !== 'PGRST205') throw error;
      } else {
        const { error } = await supabase
          .from('favorite_routines')
          .insert({ routine_id: routineId, user_id: user!.id });
        if (error && error.code !== 'PGRST205') throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite_routines'] });
    },
    onError: () => {
      toast.error('La tabla de favoritos aún no existe. Ejecuta el SQL de setup.');
    },
  });
}

// Get assigned routines specifically FOR a client (resolves the data fetch bug)
export function useMyAssignedRoutines() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['my_assigned_routines', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_routines')
        .select(`
          id, notes, assigned_at,
          routines (
            id, name, description, category, duration_minutes, video_url, created_at,
            routine_exercises ( id, name, sets, reps, rest_seconds, order_index, notes, muscle_group )
          )
        `)
        .eq('client_id', user!.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      let fetchedRoutines = (data || []).filter(cr => cr.routines).map((cr: any) => {
        const r = cr.routines;
        return {
          ...r,
          assignment_id: cr.id,
          assignment_notes: cr.notes,
          exercises: (r.routine_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index),
        };
      }) as (Routine & { assignment_id: string; assignment_notes: string | null })[];

      // --- INYECCIÓN DE DEMO: Si el cliente no tiene rutinas asignadas por el coach, le damos una de prueba ---
      if (fetchedRoutines.length === 0) {
        fetchedRoutines = [{
          id: 'demo-workout-1',
          name: '🚀 Rutina de Demostración (Prueba)',
          description: 'Rutina asignada por el sistema para que pruebes el modo Entrenar.',
          category: 'Prueba',
          duration_minutes: 20,
          video_url: null,
          created_at: new Date().toISOString(),
          assignment_id: 'demo-1',
          assignment_notes: '¡Toca el botón azul de Entrenar para probar la interfaz!',
          exercises: [
            {
              id: 'ex-1',
              name: 'Sentadillas',
              sets: 3,
              reps: '15',
              rest_seconds: 6, // Corto para que el usuario pruebe el timer rápido
              order_index: 0,
              notes: 'Baja profundo',
              muscle_group: 'Piernas'
            },
            {
              id: 'ex-2',
              name: 'Flexiones',
              sets: 2,
              reps: '10',
              rest_seconds: 6,
              order_index: 1,
              notes: 'Mantén el core firme',
              muscle_group: 'Pecho'
            }
          ]
        } as any];
      }

      return fetchedRoutines;
    },
  });
}
