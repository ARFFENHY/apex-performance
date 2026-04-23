import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Invitation {
  id: string;
  coach_id: string | null;
  email: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_role: 'coach' | 'client';
  created_at: string;
  expires_at: string;
}

export interface CoachProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export function useInvitations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['invitations', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('coach_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Invitation[];
    },
  });
}

export function useSendInvitation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, invitedRole, coachId }: { email: string; invitedRole: 'coach' | 'client'; coachId?: string }) => {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase
        .from('invitations')
        .insert({
          coach_id: coachId || user!.id,
          email: email.trim().toLowerCase(),
          token,
          status: 'pending',
          invited_role: invitedRole,
          expires_at: expiresAt.toISOString(),
        });

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ya existe una invitación pendiente para este email');
        }
        throw error;
      }

      return { token, email, invitedRole };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      const link = `${window.location.origin}/register?invite=${data.token}`;
      navigator.clipboard.writeText(link).catch(() => {});
      toast.success(`Invitación creada. Enlace copiado al portapapeles.`, {
        description: `Rol: ${data.invitedRole === 'coach' ? 'Entrenador' : 'Cliente'} — ${data.email}`,
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useAvailableCoaches() {
  return useQuery({
    queryKey: ['available_coaches'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('role', 'coach');

      if (error) throw error;
      return (profiles || []) as CoachProfile[];
    },
  });
}

export function useInvitationDetails(token: string | null) {
  return useQuery({
    queryKey: ['invitation_details', token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token!)
        .eq('status', 'pending')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Check expiration
      if (new Date(data.expires_at) < new Date()) {
        await supabase.from('invitations').update({ status: 'expired' }).eq('id', data.id);
        return null;
      }

      return data as Invitation;
    },
  });
}

export function useAcceptInvitation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ token, selectedCoachId }: { token: string; selectedCoachId?: string }) => {
      const { data: invitation, error: findError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .maybeSingle();

      if (findError) throw findError;
      if (!invitation) throw new Error('Invitación no encontrada o expirada');

      if (new Date(invitation.expires_at) < new Date()) {
        await supabase.from('invitations').update({ status: 'expired' }).eq('id', invitation.id);
        throw new Error('Esta invitación ha expirado');
      }

      // Determine coach to link with
      const coachToLink = selectedCoachId || invitation.coach_id;

      if (invitation.invited_role === 'client' && coachToLink) {
        const { error: linkError } = await supabase
          .from('coach_clients')
          .insert({ coach_id: coachToLink, client_id: user!.id });
        if (linkError && linkError.code !== '23505') throw linkError;

        // Notify coach
        await supabase.from('notifications').insert({
          user_id: coachToLink,
          type: 'new_client',
          title: 'Nuevo cliente vinculado',
          body: `Un cliente ha aceptado tu invitación`,
          data: { client_id: user!.id },
        });
      }

      // Mark invitation as accepted
      await supabase.from('invitations').update({ status: 'accepted' }).eq('id', invitation.id);

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('¡Te has vinculado exitosamente!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/** Build invitation link */
export function buildInviteLink(token: string) {
  return `${window.location.origin}/register?invite=${token}`;
}

/** Build mailto link for sending invitation */
export function buildMailtoLink(email: string, token: string, role: string) {
  const link = buildInviteLink(token);
  const roleName = role === 'coach' ? 'Entrenador' : 'Cliente';
  const subject = encodeURIComponent(`Te invitaron a GymManager como ${roleName}`);
  const body = encodeURIComponent(
    `¡Hola!\n\nTe han invitado a unirte a GymManager como ${roleName}.\n\nHaz clic en el siguiente enlace para registrarte:\n${link}\n\nEste enlace expira en 7 días.\n\n¡Te esperamos! 💪`
  );
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

/** Build WhatsApp share link */
export function buildWhatsAppLink(email: string, token: string, role: string) {
  const link = buildInviteLink(token);
  const roleName = role === 'coach' ? 'Entrenador' : 'Cliente';
  const text = encodeURIComponent(
    `¡Hola! Te han invitado a GymManager como ${roleName}. Regístrate aquí:\n${link}\n\nEl enlace expira en 7 días. 💪`
  );
  return `https://wa.me/?text=${text}`;
}

export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const newExpires = new Date();
      newExpires.setDate(newExpires.getDate() + 7);

      const { error } = await supabase
        .from('invitations')
        .update({ expires_at: newExpires.toISOString(), status: 'pending' as const })
        .eq('id', invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitación renovada por 7 días más');
    },
    onError: () => toast.error('Error al renovar invitación'),
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase.from('invitations').delete().eq('id', invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast.success('Invitación eliminada');
    },
    onError: () => toast.error('Error al eliminar invitación'),
  });
}
