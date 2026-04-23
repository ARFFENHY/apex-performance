import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { celebrateAchievement } from '@/components/AchievementOverlay';

export interface Achievement {
  id: string;
  user_id: string;
  type: string; // 'streak' | 'season' | 'workout_count' | 'daily' | 'progress'
  key: string;  // e.g., 'streak_7', 'season_spring', 'workouts_50', 'perfect_day_2024-04-22'
  unlocked_at: string;
  metadata: Record<string, unknown> | null;
}

// Streak milestones
export const STREAK_MILESTONES = [
  { days: 1, label: 'Primer Paso', icon: '🏃', desc: '¡Has registrado tu primer día de actividad!' },
  { days: 3, label: 'En Marcha', icon: '⚡', desc: 'Tres días seguidos. ¡El hábito se está formando!' },
  { days: 7, label: 'Imparable', icon: '🔥', desc: '¡Una semana completa de disciplina! Sigue así.', legendary: true },
  { days: 14, label: 'Guerrero', icon: '⚔️', desc: 'Dos semanas transformando tu vida día a día.' },
  { days: 30, label: 'Leyenda', icon: '👑', desc: '¡Un mes de compromiso total! Eres un ejemplo a seguir.', legendary: true },
];

export const SEASONS = [
  { key: 'spring', name: 'Primavera', icon: '🌸' },
  { key: 'summer', name: 'Verano', icon: '☀️' },
  { key: 'autumn', name: 'Otoño', icon: '🍂' },
  { key: 'winter', name: 'Invierno', icon: '❄️' },
];

export function useUnlockAchievement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ type, key, metadata = {} }: { type: string; key: string; metadata?: any }) => {
      // Check if already unlocked
      const { data: existing } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', user!.id)
        .eq('key', key)
        .maybeSingle();

      if (existing) return existing;

      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user!.id,
          type,
          key,
          metadata,
          unlocked_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievements'] });
    },
  });
}

export function useCheckAchievements() {
  const { user } = useAuth();
  const { mutateAsync: unlock } = useUnlockAchievement();

  const checkMilestones = async () => {
    if (!user) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const [{ data: logs }, { data: existingAchievements }, { data: weights }] = await Promise.all([
        supabase.from('daily_logs').select('log_date, workout_completed, meals_completed').eq('user_id', user.id).order('log_date', { ascending: false }),
        supabase.from('user_achievements').select('key').eq('user_id', user.id),
        supabase.from('weight_history').select('id').eq('user_id', user.id).limit(1)
      ]);

      const unlockedKeys = new Set((existingAchievements || []).map(a => a.key));
      const dailyLogs = logs || [];
      
      // Streak Calculation
      const dates = [...new Set(dailyLogs.map(l => l.log_date))].sort().reverse();
      let currentStreak = 0;
      if (dates.length > 0) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (dates[0] === todayStr || dates[0] === yesterdayStr) {
          for (let i = 0; i < dates.length; i++) {
            const expected = new Date(dates[0]);
            expected.setDate(expected.getDate() - i);
            if (dates[i] === expected.toISOString().split('T')[0]) currentStreak++;
            else break;
          }
        }
      }

      // 1. Check Streaks
      for (const m of STREAK_MILESTONES) {
        if (currentStreak >= m.days && !unlockedKeys.has(`streak_${m.days}`)) {
          await unlock({ type: 'streak', key: `streak_${m.days}`, metadata: { days: m.days } });
          if (m.legendary) {
            celebrateAchievement({ title: 'Racha Épica', label: m.label, icon: m.icon, description: m.desc });
          } else {
            import('sonner').then(({ toast }) => toast.success(`¡Logro: ${m.label}!`, { icon: m.icon }));
          }
        }
      }

      // 2. Check Workout Count
      const totalWorkouts = dailyLogs.filter(l => l.workout_completed).length;
      const workoutMilestones = [
        { count: 1, label: 'Primer Entrenamiento', icon: '🏋️', desc: '¡Has dado el primer paso hacia tu versión final!' },
        { count: 5, label: 'Ritmo Constante', icon: '⚡', desc: '5 sesiones completadas. Estás calentando motores.' },
        { count: 10, label: 'Atleta Dedicado', icon: '💪', desc: '10 entrenamientos. ¡Tu cuerpo empieza a notar la diferencia!' },
        { count: 25, label: 'Transformación Real', icon: '🔥', desc: '25 sesiones con compromiso total. Ya eres un habitual.', legendary: true },
        { count: 50, label: 'Maestro del Hierro', icon: '👑', desc: '¡50 entrenamientos! Nada puede detenerte ahora.', legendary: true },
      ];
      for (const m of workoutMilestones) {
        if (totalWorkouts >= m.count && !unlockedKeys.has(`workouts_${m.count}`)) {
          await unlock({ type: 'workout_count', key: `workouts_${m.count}`, metadata: { total: totalWorkouts } });
          if (m.legendary) {
            celebrateAchievement({ title: 'Hito de Entrenamiento', label: m.label, icon: m.icon, description: m.desc });
          } else {
            import('sonner').then(({ toast }) => toast.success(`¡Logro: ${m.label}!`, { icon: m.icon }));
          }
        }
      }

      // 3. Check Perfect Day (Today)
      const todayLog = dailyLogs.find(l => l.log_date === todayStr);
      if (todayLog?.workout_completed && todayLog?.meals_completed && !unlockedKeys.has(`perfect_day_${todayStr}`)) {
        await unlock({ type: 'daily', key: `perfect_day_${todayStr}`, metadata: { date: todayStr } });
        celebrateAchievement({ 
          title: 'Día Perfecto', 
          label: 'Disciplina Total', 
          icon: '🏆', 
          description: '¡Has cumplido al 100% con tu entrenamiento y nutrición hoy!' 
        });
      }

      // 4. Check Weight
      if (weights && weights.length > 0 && !unlockedKeys.has('first_weight_log')) {
        await unlock({ type: 'progress', key: 'first_weight_log' });
        import('sonner').then(({ toast }) => toast.success('¡Logro: Primer Registro de Peso!', { icon: '⚖️' }));
      }

      // 5. Season
      const curSeason = getCurrentSeason();
      if (!unlockedKeys.has(`season_${curSeason}`)) {
        await unlock({ type: 'season', key: `season_${curSeason}` });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return { checkMilestones };
}


export function useWorkoutStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workout_stats', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [{ data: logs }, { data: weights }] = await Promise.all([
        supabase.from('daily_logs').select('workout_completed').eq('user_id', user!.id).eq('workout_completed', true),
        supabase.from('weight_history').select('id').eq('user_id', user!.id)
      ]);

      return {
        totalWorkouts: logs?.length || 0,
        totalWeightLogs: weights?.length || 0,
      };
    },
  });
}

export function useAchievements() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievements', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user!.id);

      if (error) {
        console.warn('user_achievements query failed:', error.message);
        return [] as Achievement[];
      }

      return (data || []) as Achievement[];
    },
  });
}

export function useTrainingStreak() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['training_streak', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<number> => {
      const { data } = await supabase
        .from('daily_logs')
        .select('log_date')
        .eq('user_id', user!.id)
        .order('log_date', { ascending: false });

      if (!data || data.length === 0) return 0;

      const dates = [...new Set(data.map((d) => d.log_date))].sort().reverse();
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (dates[0] !== todayStr && dates[0] !== yesterdayStr) return 0;

      for (let i = 0; i < dates.length; i++) {
        const expected = new Date(dates[0]);
        expected.setDate(expected.getDate() - i);
        if (dates[i] === expected.toISOString().split('T')[0]) streak++;
        else break;
      }

      return streak;
    },
  });
}

function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export { getCurrentSeason };
