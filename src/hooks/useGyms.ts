import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { normalizeAppRole, type GymStatus, type GymWithCounts } from '@/types/tenant';
import { toast } from 'sonner';

export function useGyms() {
  const queryClient = useQueryClient();

  const gymsQuery = useQuery({
    queryKey: ['gyms_admin'],
    queryFn: async (): Promise<GymWithCounts[]> => {
      const { data: gyms, error: gymsError } = await supabase
        .from('gyms')
        .select('*')
        .order('created_at', { ascending: false });

      if (gymsError) {
        console.warn('gyms query:', gymsError.message);
        return [];
      }
      if (!gyms?.length) return [];

      const { data: viewData, error: viewError } = await supabase
        .from('gym_member_counts')
        .select('*');

      if (!viewError && viewData) {
        const countsMap = new Map(viewData.map(v => [v.gym_id, v]));
        return (gyms || []).map(gym => ({
          ...gym,
          coach_count: countsMap.get(gym.id)?.coach_count || 0,
          client_count: countsMap.get(gym.id)?.client_count || 0,
        }));
      }

      const gymIds = (gyms || []).map(g => g.id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('gym_id, role')
        .in('gym_id', gymIds);

      return (gyms || []).map(gym => {
        const gymProfiles = (profiles || []).filter(p => p.gym_id === gym.id);
        return {
          ...gym,
          coach_count: gymProfiles.filter(p => normalizeAppRole(p.role) === 'coach').length,
          client_count: gymProfiles.filter(p => normalizeAppRole(p.role) === 'client').length,
        };
      });
    },
  });

  const createGym = useMutation({
    mutationFn: async (data: { 
      name: string; 
      legal_name?: string | null;
      document_number?: string | null;
      address?: string | null;
      phone?: string | null;
      business_hours?: string;
      adminFullName: string;
      adminEmail: string;
    }) => {
      const { data: gym, error } = await supabase
        .from('gyms')
        .insert({
          name: data.name,
          slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
          legal_name: data.legal_name,
          document_number: data.document_number,
          address: data.address,
          email: data.adminEmail.trim(),
          phone: data.phone,
          business_hours: data.business_hours,
        })
        .select()
        .single();

      if (error) throw error;

      // Generar contraseña temporal segura
      const tempPassword = crypto.randomUUID().slice(0, 12) + "A1!";

      // Guardar sesión actual del Super Admin
      const { data: sessionData } = await supabase.auth.getSession();
      const currentSession = sessionData?.session;

      // Crear usuario Administrador en auth.users
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.adminEmail.trim(),
        password: tempPassword,
        options: {
          data: {
            full_name: data.adminFullName.trim(),
            role: "admin",
            gym_id: gym.id,
          },
        },
      });

      if (signUpError) {
        // En caso de que falle la creación del usuario, deberíamos revertir la franquicia o avisar,
        // pero por ahora reportamos el error sin borrar el gimnasio (a reevaluar según arquitectura).
        throw new Error("Franquicia creada, pero falló el alta del Admin: " + signUpError.message);
      }

      // Restaurar la sesión del Super Admin para no sacarlo de la aplicación
      if (currentSession) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
      }

      return {
        gym,
        authDetails: {
          email: data.adminEmail.trim(),
          password: tempPassword,
        }
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
      toast.success('Gimnasio creado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al crear gimnasio: ' + error.message);
    },
  });

  const updateGymStatus = useMutation({
    mutationFn: async ({ gymId, status }: { gymId: string; status: GymStatus }) => {
      const { error } = await supabase
        .from('gyms')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', gymId);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
      const labels: Record<GymStatus, string> = {
        active: 'activado',
        paused: 'pausado',
        suspended: 'suspendido',
      };
      toast.success(`Gimnasio ${labels[status]}`);
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });

  const deleteGym = useMutation({
    mutationFn: async (gymId: string) => {
      // First unlink all members from this gym
      const { error: unlinkError } = await supabase
        .from('profiles')
        .update({ gym_id: null, updated_at: new Date().toISOString() })
        .eq('gym_id', gymId);
      if (unlinkError) throw unlinkError;

      // Then delete the gym
      const { error } = await supabase
        .from('gyms')
        .delete()
        .eq('id', gymId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms_admin'] });
      queryClient.invalidateQueries({ queryKey: ['gym_members'] });
      toast.success('Gimnasio eliminado permanentemente');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });

  const sendPasswordReset = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Correo de recuperación enviado exitosamente');
    },
    onError: (error) => {
      toast.error('Error al enviar recuperación: ' + error.message);
    },
  });

  return {
    gyms: gymsQuery.data || [],
    isLoading: gymsQuery.isLoading,
    error: gymsQuery.error,
    createGym,
    updateGymStatus,
    deleteGym,
    sendPasswordReset,
  };
}
