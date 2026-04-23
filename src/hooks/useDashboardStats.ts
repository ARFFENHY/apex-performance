import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  clientCount: number;
  routineCount: number;
  nutritionPlanCount: number;
  avgWeightChange: number | null;
  recentClients: {
    id: string;
    full_name: string;
    avatar_initials: string;
    weight_change: number;
    fat_change: number;
    muscle_change: number;
    last_active: string;
  }[];
  weeklyActivity: { day: string; entrenamientos: number }[];
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard_stats', user?.id],
    enabled: !!user,
    refetchInterval: 60_000,
    queryFn: async (): Promise<DashboardStats> => {
      // 1. Get linked client IDs
      const { data: links } = await supabase
        .from('coach_clients')
        .select('client_id')
        .eq('coach_id', user!.id);

      const clientIds = (links || []).map((l) => l.client_id);

      // 2. Counts (parallel)
      const [routinesRes, plansRes] = await Promise.all([
        supabase.from('routines').select('id', { count: 'exact', head: true }).eq('coach_id', user!.id),
        supabase.from('nutrition_plans').select('id', { count: 'exact', head: true }).eq('coach_id', user!.id),
      ]);

      const routineCount = routinesRes.count ?? 0;
      const nutritionPlanCount = plansRes.count ?? 0;

      if (clientIds.length === 0) {
        return {
          clientCount: 0,
          routineCount,
          nutritionPlanCount,
          avgWeightChange: null,
          recentClients: [],
          weeklyActivity: DAY_NAMES.map((d) => ({ day: d, entrenamientos: 0 })),
        };
      }

      // 3. Profiles + progress (parallel)
      const [profilesRes, progressRes, startProgressRes] = await Promise.all([
        supabase.from('profiles').select('id, full_name, avatar_url, created_at').in('id', clientIds),
        supabase.from('body_progress').select('user_id, weight, body_fat, muscle_mass, date').in('user_id', clientIds).order('date', { ascending: false }),
        supabase.from('body_progress').select('user_id, weight, body_fat, muscle_mass').in('user_id', clientIds).order('date', { ascending: true }),
      ]);

      const profiles = profilesRes.data || [];
      const progress = progressRes.data || [];
      const startProgress = startProgressRes.data || [];

      // Latest & earliest per user
      const latestByUser = new Map<string, { weight: number; body_fat: number | null; muscle_mass: number | null }>();
      const startByUser = new Map<string, { weight: number; body_fat: number | null; muscle_mass: number | null }>();

      progress.forEach((p) => {
        if (!latestByUser.has(p.user_id)) {
          latestByUser.set(p.user_id, { weight: p.weight, body_fat: p.body_fat, muscle_mass: p.muscle_mass });
        }
      });
      startProgress.forEach((p) => {
        if (!startByUser.has(p.user_id)) {
          startByUser.set(p.user_id, { weight: p.weight, body_fat: p.body_fat, muscle_mass: p.muscle_mass });
        }
      });

      // Average weight change
      let totalChange = 0;
      let changeCount = 0;
      clientIds.forEach((id) => {
        const latest = latestByUser.get(id);
        const start = startByUser.get(id);
        if (latest && start) {
          totalChange += latest.weight - start.weight;
          changeCount++;
        }
      });
      const avgWeightChange = changeCount > 0 ? Math.round((totalChange / changeCount) * 10) / 10 : null;

      // Build recent clients list
      const getInitials = (name: string) =>
        name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

      const recentClients = profiles
        .sort((a, b) => new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime())
        .slice(0, 5)
        .map((p) => {
          const latest = latestByUser.get(p.id);
          const start = startByUser.get(p.id);
          return {
            id: p.id,
            full_name: p.full_name || 'Sin nombre',
            avatar_initials: getInitials(p.full_name || 'SN'),
            weight_change: latest && start ? Math.round((latest.weight - start.weight) * 10) / 10 : 0,
            fat_change: latest && start && latest.body_fat != null && start.body_fat != null
              ? Math.round((latest.body_fat - start.body_fat) * 10) / 10 : 0,
            muscle_change: latest && start && latest.muscle_mass != null && start.muscle_mass != null
              ? Math.round((latest.muscle_mass - start.muscle_mass) * 10) / 10 : 0,
            last_active: p.created_at || p.id,
          };
        });

      // Weekly activity from body_progress dates in last 7 days
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 6);
      const weeklyMap = new Map<string, number>();
      for (let i = 0; i < 7; i++) {
        const d = new Date(weekAgo);
        d.setDate(d.getDate() + i);
        weeklyMap.set(DAY_NAMES[d.getDay()], 0);
      }
      progress.forEach((p) => {
        const d = new Date(p.date);
        if (d >= weekAgo) {
          const dayName = DAY_NAMES[d.getDay()];
          weeklyMap.set(dayName, (weeklyMap.get(dayName) || 0) + 1);
        }
      });

      const weeklyActivity = Array.from(weeklyMap.entries()).map(([day, entrenamientos]) => ({
        day,
        entrenamientos,
      }));

      return {
        clientCount: clientIds.length,
        routineCount,
        nutritionPlanCount,
        avgWeightChange,
        recentClients,
        weeklyActivity,
      };
    },
  });
}
