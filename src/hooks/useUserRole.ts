import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { normalizeAppRole, type AppRole } from '@/types/tenant';

export type { AppRole };

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user_role', user?.id],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<AppRole> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user!.id)
        .maybeSingle();

      const fallbackRole = normalizeAppRole(user!.user_metadata?.role) || 'client';

      if (error) {
        console.warn('profiles.role query failed, falling back to metadata:', error.message);
        return fallbackRole;
      }

      return normalizeAppRole(data?.role) || fallbackRole;
    },
  });
}
