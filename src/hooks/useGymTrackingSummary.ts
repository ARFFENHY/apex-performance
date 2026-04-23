import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface GymClientTrackingSummary {
  client_id: string;
  full_name: string;
  avatar_url: string | null;
  latest_log: {
    log_date: string;
    calories_consumed: number;
    protein_consumed: number;
    carbs_consumed: number;
    fat_consumed: number;
    water_liters: number;
    training_type: string | null;
  } | null;
  goal: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    goal_type: string;
  } | null;
  logs_this_week: number;
  latest_weight: number | null;
}

export function useGymTrackingSummary(gymId: string | null) {
  return useQuery({
    queryKey: ['gym_tracking_summary', gymId],
    enabled: !!gymId,
    queryFn: async () => {
      // Get all clients in this gym
      const { data: clientProfiles, error: pErr } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .eq('gym_id', gymId!)
        .eq('role', 'client');

      if (pErr || !clientProfiles?.length) return [];

      const clientIds = clientProfiles.map(c => c.id);
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const todayStr = today.toISOString().split('T')[0];
      const weekAgoStr = weekAgo.toISOString().split('T')[0];

      // Fetch in parallel: daily_logs (last 7 days), fitness_goals, weight_history
      const [logsRes, goalsRes, weightRes] = await Promise.all([
        supabase
          .from('daily_logs')
          .select('user_id, log_date, calories_consumed, protein_consumed, carbs_consumed, fat_consumed, water_liters, training_type')
          .in('user_id', clientIds)
          .gte('log_date', weekAgoStr)
          .lte('log_date', todayStr)
          .order('log_date', { ascending: false }),
        supabase
          .from('fitness_goals')
          .select('user_id, calories, protein, carbs, fat, goal_type')
          .in('user_id', clientIds)
          .eq('is_active', true),
        supabase
          .from('weight_history')
          .select('user_id, weight')
          .in('user_id', clientIds)
          .order('recorded_at', { ascending: false }),
      ]);

      const logs = logsRes.data || [];
      const goals = goalsRes.data || [];
      const weights = weightRes.data || [];

      // Build maps
      const latestLogByUser = new Map<string, typeof logs[0]>();
      const logsCountByUser = new Map<string, number>();
      logs.forEach(l => {
        if (!latestLogByUser.has(l.user_id)) latestLogByUser.set(l.user_id, l);
        logsCountByUser.set(l.user_id, (logsCountByUser.get(l.user_id) || 0) + 1);
      });

      const goalByUser = new Map<string, typeof goals[0]>();
      goals.forEach(g => { if (!goalByUser.has(g.user_id)) goalByUser.set(g.user_id, g); });

      const weightByUser = new Map<string, number>();
      weights.forEach(w => { if (!weightByUser.has(w.user_id)) weightByUser.set(w.user_id, w.weight); });

      return clientProfiles.map(p => {
        const ll = latestLogByUser.get(p.id);
        const g = goalByUser.get(p.id);
        return {
          client_id: p.id,
          full_name: p.full_name || 'Sin nombre',
          avatar_url: p.avatar_url,
          latest_log: ll ? {
            log_date: ll.log_date,
            calories_consumed: ll.calories_consumed,
            protein_consumed: ll.protein_consumed,
            carbs_consumed: ll.carbs_consumed,
            fat_consumed: ll.fat_consumed,
            water_liters: ll.water_liters,
            training_type: ll.training_type,
          } : null,
          goal: g ? {
            calories: g.calories,
            protein: g.protein,
            carbs: g.carbs,
            fat: g.fat,
            goal_type: g.goal_type,
          } : null,
          logs_this_week: logsCountByUser.get(p.id) || 0,
          latest_weight: weightByUser.get(p.id) ?? null,
        } as GymClientTrackingSummary;
      });
    },
  });
}
