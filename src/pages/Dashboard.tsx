import { Users, Dumbbell, Apple, TrendingUp, Plus, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { ClientRow } from "@/components/ClientRow";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/DashboardLayout";
import { WeeklyChart } from "@/components/WeeklyChart";
import { InviteClientDialog } from "@/components/InviteClientDialog";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] || 'Entrenador';

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
        {/* Header */}
        <motion.div variants={item}>
          <div className="feature-card text-white p-6 md:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80 mb-2">Panel de Entrenador</p>
              <h1 className="text-3xl md:text-4xl font-extrabold font-display">
                Bienvenido, {displayName} 👋
              </h1>
              <p className="text-sm text-white/70 mt-2">Aquí tienes el resumen de tus clientes</p>
            </div>
            <InviteClientDialog
              trigger={
                <Button variant="premium" size="lg" className="gap-2 rounded-xl shadow-neon hover:scale-105 transition-transform w-fit">
                  <Plus className="h-4 w-4" /> Nuevo Cliente
                </Button>
              }
            />
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Clientes Activos"
                value={stats?.clientCount ?? 0}
                subtitle={stats?.clientCount === 0 ? "Invita a tu primer cliente" : undefined}
                icon={<Users className="h-5 w-5 text-primary-foreground" />}
                variant="primary"
              />
              <StatCard
                title="Rutinas Activas"
                value={stats?.routineCount ?? 0}
                subtitle={stats?.routineCount === 0 ? "Crea tu primera rutina" : undefined}
                icon={<Dumbbell className="h-5 w-5 text-success-foreground" />}
                variant="success"
              />
              <StatCard
                title="Planes Nutricionales"
                value={stats?.nutritionPlanCount ?? 0}
                subtitle={stats?.nutritionPlanCount === 0 ? "Crea tu primer plan" : undefined}
                icon={<Apple className="h-5 w-5 text-energy-foreground" />}
                variant="energy"
              />
              <StatCard
                title="Progreso Promedio"
                value={stats?.avgWeightChange != null ? `${stats.avgWeightChange > 0 ? '+' : ''}${stats.avgWeightChange} kg` : "—"}
                trend={stats?.avgWeightChange != null ? {
                  value: stats.avgWeightChange <= 0 ? "Buen progreso" : "Revisar planes",
                  positive: stats.avgWeightChange <= 0,
                } : undefined}
                icon={<TrendingUp className="h-5 w-5 text-primary" />}
              />
            </>
          )}
        </motion.div>

        {/* Charts + Client list */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <motion.div variants={item} className="lg:col-span-2">
            <div className="card-premium p-6 h-full border-border/50">
              <h3 className="text-sm font-semibold font-display mb-4">Actividad Semanal</h3>
              {isLoading ? (
                <Skeleton className="h-[200px] w-full rounded-lg bg-muted/60" />
              ) : (
                <WeeklyChart data={stats?.weeklyActivity ?? []} />
              )}
            </div>
          </motion.div>

          <motion.div variants={item} className="lg:col-span-3">
            <div className="card-premium p-6 border-border/50 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold font-display">Clientes Recientes</h3>
                <Link to="/clients">
                  <Button variant="ghost" size="sm" className="text-xs text-primary hover:bg-primary/10 gap-1 rounded-full transition-colors">
                    Ver todos <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg bg-muted/60" />
                  ))}
                </div>
              ) : stats?.recentClients.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground/60 glass rounded-xl border-dashed">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Aún no tienes clientes vinculados
                </div>
              ) : (
                <div className="space-y-2">
                  {stats?.recentClients.map((client) => (
                    <div className="group transition-transform hover:-translate-y-0.5">
                      <ClientRow
                        key={client.id}
                        name={client.full_name}
                        avatar={client.avatar_initials}
                        weightChange={client.weight_change}
                        fatLost={Math.abs(client.fat_change)}
                        musclGained={client.muscle_change}
                        lastActive={
                          client.last_active
                            ? formatDistanceToNow(new Date(client.last_active), { addSuffix: true, locale: es })
                            : '—'
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
