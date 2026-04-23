import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface NutritionPlan {
  id: string;
  client_id: string;
  client_name: string;
  client_avatar: string | null;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
}

export function useNutritionPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['nutrition_plans', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutrition_plans')
        .select('id, client_id, name, calories, protein, carbs, fat, created_at')
        .eq('coach_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('nutrition_plans query:', error.message);
        return [];
      }

      // Fetch client names separately to avoid FK join issues
      const clientIds = [...new Set((data || []).map((p: any) => p.client_id))];
      let profilesMap: Record<string, { full_name: string; avatar_url: string | null }> = {};
      if (clientIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', clientIds);
        for (const p of profiles || []) {
          profilesMap[p.id] = { full_name: p.full_name || 'Sin nombre', avatar_url: p.avatar_url };
        }
      }

      return (data || []).map((p: any) => ({
        id: p.id,
        client_id: p.client_id,
        client_name: profilesMap[p.client_id]?.full_name || 'Sin nombre',
        client_avatar: profilesMap[p.client_id]?.avatar_url || null,
        name: p.name,
        calories: p.calories,
        protein: p.protein,
        carbs: p.carbs,
        fat: p.fat,
        created_at: p.created_at,
      })) as NutritionPlan[];
    },
  });
}

export function useCreateNutritionPlan() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { client_id: string; name: string; calories: number; protein: number; carbs: number; fat: number }) => {
      const { error } = await supabase
        .from('nutrition_plans')
        .insert({ ...data, coach_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition_plans'] });
    },
  });
}

export function useUpdateNutritionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }) => {
      const { error } = await supabase
        .from('nutrition_plans')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition_plans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}

export function useDeleteNutritionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('nutrition_plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition_plans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}
