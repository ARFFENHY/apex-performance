import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { normalizeAppRole, type UserStatus, type AppRole } from '@/types/tenant';

export interface GymMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  status: UserStatus;
  role: AppRole;
  created_at: string;
}

export function useGymMembers(gymId: string | null) {
  const queryClient = useQueryClient();

  const membersQuery = useQuery({
    queryKey: ['gym_members', gymId],
    enabled: !!gymId,
    queryFn: async (): Promise<GymMember[]> => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, status, role, created_at')
        .eq('gym_id', gymId!);

      if (error) {
        console.warn('gym_members query:', error.message);
        return [];
      }
      if (!profiles?.length) return [];

      return profiles.map(p => ({
        id: p.id,
        full_name: p.full_name || 'Sin nombre',
        email: p.email || '',
        avatar_url: p.avatar_url,
        status: (p.status as UserStatus) || 'active',
        role: normalizeAppRole(p.role) || 'client',
        created_at: p.created_at,
      }));
    },
  });

  const updateMemberStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: UserStatus }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['gym_members', gymId] });
      const labels: Record<UserStatus, string> = { active: 'activado', paused: 'pausado', suspended: 'suspendido' };
      toast.success(`Usuario ${labels[status]}`);
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const changeMemberRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, { newRole }) => {
      queryClient.invalidateQueries({ queryKey: ['gym_members', gymId] });
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
      const labels: Record<string, string> = { coach: 'Coach', client: 'Cliente', admin: 'Admin' };
      toast.success(`Rol cambiado a ${labels[newRole] || newRole}`);
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const removeMemberFromGym = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ gym_id: null, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_members', gymId] });
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
      toast.success('Usuario desvinculado del gimnasio');
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const assignMemberToGym = useMutation({
    mutationFn: async ({ userId, targetGymId }: { userId: string; targetGymId: string }) => {
      const { error } = await supabase.rpc('assign_user_to_gym', {
        _user_id: userId,
        _gym_id: targetGymId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_members'] });
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
      queryClient.invalidateQueries({ queryKey: ['unassigned_users'] });
      toast.success('Usuario asignado al gimnasio');
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const assignClientToCoach = useMutation({
    mutationFn: async ({ clientId, coachId }: { clientId: string; coachId: string }) => {
      const { error } = await supabase.rpc('assign_client_to_coach', {
        _client_id: clientId,
        _coach_id: coachId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_members', gymId] });
      toast.success('Cliente asignado al coach');
    },
    onError: (error) => toast.error('Error: ' + error.message),
  });

  const deleteMember = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym_members', gymId] });
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
      toast.success('Usuario eliminado permanentemente');
    },
    onError: (error) => toast.error('Error al eliminar: ' + error.message),
  });

  return {
    members: membersQuery.data || [],
    coaches: (membersQuery.data || []).filter(m => m.role === 'coach' || m.role === 'admin'),
    clients: (membersQuery.data || []).filter(m => m.role === 'client'),
    isLoading: membersQuery.isLoading,
    updateMemberStatus,
    removeMemberFromGym,
    assignMemberToGym,
    changeMemberRole,
    assignClientToCoach,
    deleteMember,
  };
}

export function useUnassignedUsers() {
  return useQuery({
    queryKey: ['unassigned_users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, role, created_at')
        .is('gym_id', null)
        .neq('role', 'super_admin');

      if (error) throw error;

      return (profiles || []).map(p => ({
        id: p.id,
        full_name: p.full_name || 'Sin nombre',
        email: p.email || '',
        avatar_url: p.avatar_url,
        role: normalizeAppRole(p.role) || 'client',
        created_at: p.created_at,
      }));
    },
  });
}
