import { DashboardLayout } from "@/components/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import { useClientWorkouts } from "@/hooks/useClientWorkouts";
import { useDiets } from "@/hooks/useDiets";
import { useMyAssignedRoutines } from "@/hooks/useClientRoutines";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dumbbell, Apple, TrendingUp, Trophy, Target, Flame,
  ChevronRight, ClipboardList, Calculator, Zap, PlayCircle, CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveFitnessGoal } from "@/hooks/useFitnessGoals";
import { useDailyLog } from "@/hooks/useDailyLogs";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

function formatDate() {
  return new Date().toISOString().split('T')[0];
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: routines = [], isLoading: routinesLoading } = useMyAssignedRoutines();
  const { data: workouts = [] } = useClientWorkouts();
  const { data: diets = [] } = useDiets();
  const { data: goal } = useActiveFitnessGoal();
  const { data: todayLog } = useDailyLog(formatDate());

  const displayName = profile?.display_name || user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario';

  const calConsumed = todayLog?.calories_consumed || 0;
  const calTarget = goal?.calories || 0;
  const calRemaining = Math.max(calTarget - calConsumed, 0);
  const calPct = calTarget > 0 ? Math.min((calConsumed / calTarget) * 100, 100) : 0;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  })();

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-8">
        {/* Hero greeting */}
        <motion.div variants={item} className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{greeting}</p>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight">
            {displayName}
          </h1>
        </motion.div>

        {/* Today's summary — Nike-style dark card */}
        {goal && (
          <motion.div variants={item}>
            <div className="feature-card text-white p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Resumen de hoy</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-extrabold font-display">{calConsumed}</span>
                    <span className="text-lg text-white/40 font-medium mb-1">/ {calTarget} kcal</span>
                  </div>
                  <div className="w-full max-w-xs">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full gradient-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${calPct}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-white/50">
                    {calRemaining > 0 ? `${calRemaining} kcal restantes` : '¡Objetivo alcanzado!'}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold">{todayLog?.protein_consumed || 0}g</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Proteína</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold">{todayLog?.carbs_consumed || 0}g</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Carbos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-extrabold">{todayLog?.fat_consumed || 0}g</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/40 mt-1">Grasas</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                {todayLog?.workout_completed && todayLog?.meals_completed ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="lg" className="gap-2 rounded-xl border-white/20 hover:bg-white/10 text-white">
                        <CheckCircle2 className="h-4 w-4 text-[#00FF87]" />
                        Modificar Registro
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-slate-950 border-white/10 rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-display font-black text-white italic tracking-tighter uppercase">DÍA YA REGISTRADO</AlertDialogTitle>
                        <AlertDialogDescription className="text-white/60 font-medium">
                          Ya has completado tu registro de hoy satisfactoriamente. ¿Deseas entrar de todas formas para modificar algún detalle?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl border-white/10 text-white/50 hover:text-white bg-transparent">Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => navigate("/tracking")}
                          className="rounded-xl bg-primary text-white font-bold"
                        >
                          Continuar y Modificar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Link to="/tracking">
                    <Button variant="premium" size="lg" className="gap-2 rounded-xl">
                      <ClipboardList className="h-4 w-4" />
                      Registrar día
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick action cards — horizontal scroll on mobile */}
        <motion.div variants={item}>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-4 scrollbar-none">
            {[
              { label: 'Rutinas', value: routines.length, icon: Dumbbell, to: '/exercises', color: 'text-primary' },
              { label: 'Dietas', value: diets.length, icon: Apple, to: '/diets', color: 'text-success' },
              { label: 'Entrenamientos', value: workouts.length, icon: Flame, to: '/progress', color: 'text-energy' },
              { label: 'Logros', value: '→', icon: Trophy, to: '/achievements', color: 'text-primary' },
            ].map((s) => (
              <Link key={s.label} to={s.to} className="min-w-[140px] md:min-w-0">
                <Card className="hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 group">
                  <CardContent className="pt-5 pb-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                      <s.icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{s.label}</p>
                      <p className="text-xl font-extrabold">{routinesLoading ? '…' : s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Feature cards row — Nike style */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/tracking">
            <div className="feature-card group cursor-pointer min-h-[140px] flex flex-col justify-between">
              <div>
                <Zap className="h-6 w-6 text-primary mb-3" />
                <h3 className="text-lg font-extrabold text-white">SEGUIMIENTO DIARIO</h3>
                <p className="text-sm text-white/50 mt-1">Registra comidas, agua y entrenamiento</p>
              </div>
              <div className="flex items-center gap-1 text-primary text-sm font-semibold mt-4">
                Comenzar <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link to="/calculator">
            <div className="feature-card group cursor-pointer min-h-[140px] flex flex-col justify-between">
              <div>
                <Calculator className="h-6 w-6 text-primary mb-3" />
                <h3 className="text-lg font-extrabold text-white">PLAN NUTRICIONAL</h3>
                <p className="text-sm text-white/50 mt-1">Calcula tus macros y configura tu objetivo</p>
              </div>
              <div className="flex items-center gap-1 text-primary text-sm font-semibold mt-4">
                Configurar <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Routines section */}
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold font-display uppercase tracking-wide">Mis Rutinas</h2>
            <Link to="/exercises">
              <Button variant="ghost" size="sm" className="text-xs text-primary gap-1">
                Ver catálogo <ChevronRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          {routinesLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-16 rounded-2xl" />)}
            </div>
          ) : routines.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Dumbbell className="h-8 w-8 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Aún no tienes rutinas asignadas</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {routines.slice(0, 5).map((r: any) => (
                <div key={r.id} className="relative rounded-2xl bg-black border border-white/10 p-5 overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner">
                        <Dumbbell className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-black font-display text-white tracking-tight">{r.name}</p>
                        <p className="text-xs text-white/50">{r.exercises?.length || 0} Ejercicios • {r.duration_minutes || 45} min</p>
                      </div>
                    </div>
                    <Link to={`/workout/${r.id}`}>
                      <Button variant="premium" className="h-10 w-10 sm:h-12 sm:w-auto rounded-full sm:rounded-xl sm:px-6 shadow-neon group-hover:scale-105 transition-all">
                        <PlayCircle className="h-5 w-5 sm:mr-2" />
                        <span className="hidden sm:inline font-bold">ENTRENAR</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick links */}
        <motion.div variants={item} className="grid grid-cols-2 gap-3">
          <Link to="/progress">
            <Card className="hover:shadow-card-hover hover:border-primary/20 transition-all group">
              <CardContent className="py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Mi Progreso</p>
                    <p className="text-[10px] text-muted-foreground">Peso, grasa, músculo</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/profile">
            <Card className="hover:shadow-card-hover hover:border-primary/20 transition-all group">
              <CardContent className="py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">Mi Perfil</p>
                    <p className="text-[10px] text-muted-foreground">Info y objetivos</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
