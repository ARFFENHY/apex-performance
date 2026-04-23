import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Client {
  id: string;
  full_name: string;
  avatar_url: string | null;
  email: string;
  created_at: string;
  // from body_progress (latest)
  weight?: number;
  start_weight?: number;
  body_fat?: number;
  muscle_mass?: number;
}

export function useClients(gymId?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients', user?.id, gymId],
    enabled: !!user,
    queryFn: async () => {
      // B2B: Extraer TODOS los clientes pertenecientes al gimnasio del Coach/Admin
      let query = supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('role', 'client');
        
      // Si tenemos gymId, filtramos el ecosistema. Si no, intentaremos restringir por RLS
      if (gymId) {
        query = query.eq('gym_id', gymId);
      }

      const { data: profiles, error: profilesError } = await query;
      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) return [];

      const clientIds = profiles.map(p => p.id);

      // Get latest body progress for each client
      const { data: progress } = await supabase
        .from('body_progress')
        .select('user_id, weight, body_fat, muscle_mass, date')
        .in('user_id', clientIds)
        .order('date', { ascending: false });

      // Get earliest body progress for start weight
      const { data: startProgress } = await supabase
        .from('body_progress')
        .select('user_id, weight')
        .in('user_id', clientIds)
        .order('date', { ascending: true });

      const latestByUser = new Map<string, { weight: number; body_fat: number | null; muscle_mass: number | null }>();
      const startByUser = new Map<string, number>();

      progress?.forEach((p) => {
        if (!latestByUser.has(p.user_id)) {
          latestByUser.set(p.user_id, { weight: p.weight, body_fat: p.body_fat, muscle_mass: p.muscle_mass });
        }
      });

      startProgress?.forEach((p) => {
        if (!startByUser.has(p.user_id)) {
          startByUser.set(p.user_id, p.weight);
        }
      });

      // Get emails from auth (we use user metadata or just omit)
      return (profiles || []).map((p) => ({
        id: p.id,
        full_name: p.full_name || 'Sin nombre',
        avatar_url: p.avatar_url,
        email: '',
        created_at: p.created_at,
        weight: latestByUser.get(p.id)?.weight,
        start_weight: startByUser.get(p.id),
        body_fat: latestByUser.get(p.id)?.body_fat ?? undefined,
        muscle_mass: latestByUser.get(p.id)?.muscle_mass ?? undefined,
      })) as Client[];
    },
  });
}

export function useAddClient() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from('coach_clients')
        .insert({ coach_id: user!.id, client_id: clientId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
