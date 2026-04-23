import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_type: 'emoji' | 'icon' | 'image';
  avatar_value: string;
  notification_style: string;
  interests: string[];
  goals: string[];
  gender: 'male' | 'female' | 'neutral' | null;
  motivational_message: string | null;
  motivational_date: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_PROFILE: Partial<UserProfile> = {
  display_name: '',
  avatar_type: 'emoji',
  avatar_value: '💪',
  notification_style: 'all',
  interests: [],
  goals: [],
  gender: null,
  motivational_message: null,
  motivational_date: null,
};

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) {
        console.warn('user_profiles query failed:', error.message);
        return {
          ...DEFAULT_PROFILE,
          user_id: user!.id,
          display_name: user!.user_metadata?.full_name || 'Usuario',
        } as UserProfile;
      }

      if (!data) {
        // Create default profile
        const newProfile = {
          user_id: user!.id,
          display_name: user!.user_metadata?.full_name || 'Usuario',
          ...DEFAULT_PROFILE,
        };
        const { data: created } = await supabase
          .from('user_profiles')
          .insert(newProfile)
          .select()
          .single();
        return (created || newProfile) as UserProfile;
      }

      return data as UserProfile;
    },
  });
}

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user!.id);

      if (error) throw error;
    },
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['profile', user?.id] });
      const prev = queryClient.getQueryData(['profile', user?.id]);
      queryClient.setQueryData(['profile', user?.id], (old: UserProfile | undefined) =>
        old ? { ...old, ...updates } : old
      );
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['profile', user?.id], context.prev);
      }
      toast({ title: 'Error al guardar', description: 'No se pudo actualizar el perfil', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Perfil actualizado', description: 'Los cambios se guardaron correctamente' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
}

export function useUpdateGymProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gymId, updates }: { gymId: string, updates: Partial<{name: string, address: string | null, phone: string | null}> }) => {
      const { error } = await supabase
        .from('gyms')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', gymId);

      if (error) throw error;
    },
    onSuccess: (_, { gymId }) => {
      toast({ title: 'Gimnasio actualizado', description: 'Se han guardado los datos comerciales' });
      queryClient.invalidateQueries({ queryKey: ['gym_info', gymId] });
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'No se pudo actualizar el gimnasio: ' + error.message, variant: 'destructive' });
    }
  });
}
