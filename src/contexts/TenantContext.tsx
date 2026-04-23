import { createContext, useContext, ReactNode, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeAppRole, type Gym, type GymStatus, type UserStatus, type AppRole } from '@/types/tenant';

interface TenantContextType {
  gym: Gym | null;
  gymStatus: GymStatus | null;
  userStatus: UserStatus | null;
  role: AppRole | null;
  isSuperAdmin: boolean;
  isGymActive: boolean;
  isGymPaused: boolean;
  isGymSuspended: boolean;
  isUserActive: boolean;
  loading: boolean;
  canPerformActions: boolean;
  isImpersonating: boolean;
  startImpersonating: (gymId: string) => void;
  stopImpersonating: () => void;
}

const TenantContext = createContext<TenantContextType>({
  gym: null,
  gymStatus: null,
  userStatus: null,
  role: null,
  isSuperAdmin: false,
  isGymActive: false,
  isGymPaused: false,
  isGymSuspended: false,
  isUserActive: false,
  loading: true,
  canPerformActions: false,
  isImpersonating: false,
  startImpersonating: () => {},
  stopImpersonating: () => {},
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile_tenant', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, gym_id, status')
        .eq('id', user!.id)
        .maybeSingle();

      const fallbackRole = normalizeAppRole(user!.user_metadata?.role) || 'client';

      if (error) {
        console.warn('profile query failed:', error.message);
        return { role: fallbackRole, gym_id: null, status: 'active' as UserStatus };
      }

      return {
        role: normalizeAppRole(data?.role) || fallbackRole,
        gym_id: data?.gym_id || null,
        status: (data?.status as UserStatus) || 'active',
      };
    },
  });

  // Logica de Suplantación (Impersonation)
  const [impersonatedGymId, setImpersonatedGymId] = useState<string | null>(
    localStorage.getItem('apex_imp_gym_id')
  );

  const startImpersonating = (gymId: string) => {
    localStorage.setItem('apex_imp_gym_id', gymId);
    setImpersonatedGymId(gymId);
  };

  const stopImpersonating = () => {
    localStorage.removeItem('apex_imp_gym_id');
    setImpersonatedGymId(null);
  };

  const baseRole = profile?.role || null;
  const dbIsSuperAdmin = baseRole === 'super_admin';
  const isImpersonating = dbIsSuperAdmin && impersonatedGymId !== null;

  // Si estamos suplantando, el rol local es 'admin'. Si no, es normal.
  const role = isImpersonating ? 'admin' : baseRole;
  // Solo la UI cree que NO somos superadmin para forzar el comportamiento de franquicia normal.
  const isSuperAdmin = dbIsSuperAdmin && !isImpersonating;
  const activeGymId = isImpersonating ? impersonatedGymId : profile?.gym_id;

  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: ['gym_info', activeGymId],
    enabled: !!activeGymId && (!dbIsSuperAdmin || isImpersonating),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gyms')
        .select('*')
        .eq('id', activeGymId!)
        .maybeSingle();

      if (error) {
        console.warn('gym query failed:', error.message);
        return null;
      }
      return data as Gym | null;
    },
  });

  const gymStatus = gym?.status || null;
  const userStatus = (profile?.status as UserStatus) || 'active';

  const isGymActive = isSuperAdmin || gymStatus === 'active';
  const isGymPaused = !isSuperAdmin && gymStatus === 'paused';
  const isGymSuspended = !isSuperAdmin && gymStatus === 'suspended';
  const isUserActive = userStatus === 'active';
  const canPerformActions = isSuperAdmin || (isGymActive && isUserActive);

  const loading = profileLoading || (!!profile?.gym_id && gymLoading);

  return (
    <TenantContext.Provider
      value={{
        gym: gym || null,
        gymStatus,
        userStatus,
        role,
        isSuperAdmin,
        isGymActive,
        isGymPaused,
        isGymSuspended,
        isUserActive,
        loading,
        canPerformActions,
        isImpersonating,
        startImpersonating,
        stopImpersonating,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export const useTenant = () => useContext(TenantContext);
