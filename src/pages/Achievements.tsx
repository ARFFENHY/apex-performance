import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { Trophy, Flame, Star, Target, Medal } from "lucide-react";
import { useAchievements, useCheckAchievements, useTrainingStreak, useWorkoutStats, STREAK_MILESTONES, SEASONS } from "@/hooks/useAchievements";
import { Skeleton } from "@/components/ui/skeleton";
import { ShareButton } from "@/components/ShareButton";
import { useEffect } from "react";

const Achievements = () => {
  const { data: achievements = [], isLoading } = useAchievements();
  const { data: currentStreak = 0 } = useTrainingStreak();
  const { data: stats } = useWorkoutStats();
  const { checkMilestones } = useCheckAchievements();

  useEffect(() => {
    checkMilestones();
  }, []);

  const unlockedKeys = new Set(achievements.map((a) => a.key));

  const streakItems = STREAK_MILESTONES.map((s) => ({
    ...s,
    unlocked: unlockedKeys.has(`streak_${s.days}`) || currentStreak >= s.days,
  }));

  const seasonItems = SEASONS.map((s) => ({
    ...s,
    completed: unlockedKeys.has(`season_${s.key}`),
  }));

  const seasonsCompleted = seasonItems.filter((s) => s.completed).length;
  const isMasterOfYear = seasonsCompleted === 4;

  // Challenges based on real data
  // Challenges based on real stats
  const totalWorkouts = stats?.totalWorkouts || 0;
  const totalWeightLogs = stats?.totalWeightLogs || 0;

  const challenges = [
    { name: "Completa 5 entrenamientos", progress: Math.min(totalWorkouts, 5), total: 5 },
    { name: "Registra tu peso semanal", progress: Math.min(totalWeightLogs, 1), total: 1 },
    { name: `Racha de ${STREAK_MILESTONES[2].days} días`, progress: Math.min(currentStreak, STREAK_MILESTONES[2].days), total: STREAK_MILESTONES[2].days },
  ];

  // Next streak milestone
  const nextMilestone = STREAK_MILESTONES.find((s) => s.days > currentStreak);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-display">Logros</h1>
          <p className="text-sm text-muted-foreground mt-1">Tu camino de superación</p>
        </div>

        {/* Streak */}
        <div className="rounded-xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-energy" />
            <h3 className="text-sm font-semibold font-display">Racha de Entrenamiento</h3>
            <span className="ml-auto text-sm font-bold text-energy">🔥 {currentStreak} {currentStreak === 1 ? 'día' : 'días'}</span>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {streakItems.map((a) => (
              <div
                key={a.days}
                className={`rounded-xl p-3 text-center transition-all ${
                  a.unlocked ? "bg-energy/10 border-2 border-energy/20" : "bg-accent/50 opacity-50"
                }`}
              >
                <span className="text-2xl">{a.icon}</span>
                <p className="text-xs font-semibold mt-1">{a.label}</p>
                <p className="text-[10px] text-muted-foreground">{a.days} {a.days === 1 ? "día" : "días"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal medal */}
        <div className="rounded-xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Medal className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold font-display">
              Medalla Anual — Maestro del Año {isMasterOfYear && "🏅"}
            </h3>
          </div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {seasonItems.map((s) => (
              <div
                key={s.key}
                className={`rounded-xl p-4 text-center ${
                  s.completed ? "gradient-primary text-primary-foreground" : "bg-accent/50"
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <p className="text-xs font-semibold mt-1">{s.name}</p>
                <p className="text-[10px] mt-0.5">{s.completed ? "✅ Completada" : "Pendiente"}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-accent">
              <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${(seasonsCompleted / 4) * 100}%` }} />
            </div>
            <span className="text-xs font-medium">{seasonsCompleted}/4</span>
          </div>
          {isMasterOfYear && (
            <div className="mt-3 rounded-lg gradient-energy p-3 text-center">
              <p className="text-sm font-bold text-energy-foreground">🏆 ¡Maestro del Año desbloqueado!</p>
            </div>
          )}
        </div>

        {/* Weekly challenges */}
        <div className="rounded-xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-success" />
            <h3 className="text-sm font-semibold font-display">Desafíos Semanales</h3>
          </div>
          <div className="space-y-4">
            {challenges.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {c.progress}/{c.total}
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-accent">
                  <div
                    className={`h-full rounded-full transition-all ${c.progress >= c.total ? "gradient-success" : "gradient-primary"}`}
                    style={{ width: `${Math.min((c.progress / c.total) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Milestones */}
        <div className="rounded-xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="text-sm font-semibold font-display">Hitos Diarios</h3>
          </div>
          <div className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border-2 border-dashed border-accent">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-bold font-display uppercase tracking-wider">Días Perfectos</p>
                <p className="text-xs text-muted-foreground">Entrenamiento + Nutrición completados</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black italic tracking-tighter text-yellow-500">
                {achievements.filter(a => a.type === 'daily' && a.key.startsWith('perfect_day_')).length}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Desbloqueados</p>
            </div>
          </div>
        </div>

        {/* Motivational */}
        <div className="rounded-xl gradient-energy p-5 text-energy-foreground">
          <div className="flex items-start justify-between">
            <h3 className="font-display font-bold flex items-center gap-2">
              <Star className="h-5 w-5" /> ¡Mensaje Motivacional!
            </h3>
            <ShareButton
              text={
                currentStreak > 0
                  ? `🔥 ¡Llevo ${currentStreak} ${currentStreak === 1 ? "día" : "días consecutivos"} entrenando en GymManager! 💪`
                  : "💪 ¡Comenzando mi camino fitness con GymManager!"
              }
              title="Mi progreso"
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs -mt-1"
            />
          </div>
          <p className="text-sm mt-2 text-white/90">
            {currentStreak > 0 ? (
              <>
                Llevas <strong>{currentStreak} {currentStreak === 1 ? 'día' : 'días consecutivos'}</strong> entrenando.
                {nextMilestone && (
                  <> ¡Estás a solo {nextMilestone.days - currentStreak} días de desbloquear el logro <strong>{nextMilestone.label}</strong>! No te detengas 💪</>
                )}
                {!nextMilestone && <> ¡Has desbloqueado todos los logros de racha! Eres una leyenda 🏆</>}
              </>
            ) : (
              <>¡Comienza tu primer día de entrenamiento para iniciar tu racha! 💪</>
            )}
          </p>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Achievements;
