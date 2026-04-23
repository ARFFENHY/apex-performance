import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGymTrackingSummary, type GymClientTrackingSummary } from "@/hooks/useGymTrackingSummary";
import { ClientProgressView } from "@/components/ClientProgressView";
import { Flame, Beef, GlassWater, Dumbbell, AlertTriangle, CheckCircle2, Scale, Activity, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  gymId: string;
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function ClientTrackingCard({ client, onViewDetail }: { client: GymClientTrackingSummary; onViewDetail: () => void }) {
  const log = client.latest_log;
  const goal = client.goal;
  const calPct = log && goal && goal.calories > 0
    ? Math.min((log.calories_consumed / goal.calories) * 100, 150)
    : 0;
  const daysLogged = client.logs_this_week;
  const isInactive = daysLogged === 0;
  const isConsistent = daysLogged >= 5;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-all border border-border/50"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {getInitials(client.full_name)}
          </div>
          <div>
            <p className="text-sm font-semibold">{client.full_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isInactive ? (
                <span className="flex items-center gap-1 text-[10px] text-amber-600">
                  <AlertTriangle className="h-2.5 w-2.5" /> Sin registros esta semana
                </span>
              ) : isConsistent ? (
                <span className="flex items-center gap-1 text-[10px] text-green-600">
                  <CheckCircle2 className="h-2.5 w-2.5" /> {daysLogged} días registrados
                </span>
              ) : (
                <span className="text-[10px] text-muted-foreground">{daysLogged}/7 días registrados</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onViewDetail}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
      </div>

      {log ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-medium">
              {new Date(log.log_date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
            {goal && (
              <Badge variant="outline" className="text-[9px] h-4">
                {goal.goal_type}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="rounded bg-blue-50 dark:bg-blue-950/30 p-1.5">
              <Flame className="h-3 w-3 text-blue-500 mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">{log.calories_consumed}</p>
              <p className="text-[8px] text-muted-foreground">kcal</p>
            </div>
            <div className="rounded bg-red-50 dark:bg-red-950/30 p-1.5">
              <Beef className="h-3 w-3 text-red-500 mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">{log.protein_consumed}g</p>
              <p className="text-[8px] text-muted-foreground">Prot</p>
            </div>
            <div className="rounded bg-cyan-50 dark:bg-cyan-950/30 p-1.5">
              <GlassWater className="h-3 w-3 text-cyan-500 mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">{log.water_liters}L</p>
              <p className="text-[8px] text-muted-foreground">Agua</p>
            </div>
            <div className="rounded bg-purple-50 dark:bg-purple-950/30 p-1.5">
              <Scale className="h-3 w-3 text-purple-500 mx-auto mb-0.5" />
              <p className="text-[11px] font-bold">{client.latest_weight ?? '—'}</p>
              <p className="text-[8px] text-muted-foreground">kg</p>
            </div>
          </div>

          {goal && goal.calories > 0 && (
            <div className="flex items-center gap-2">
              <Progress
                value={Math.min(calPct, 100)}
                className={`h-1.5 flex-1 ${calPct > 110 ? '[&>div]:bg-amber-500' : calPct >= 80 ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'}`}
              />
              <span className="text-[10px] text-muted-foreground w-10 text-right">{Math.round(calPct)}%</span>
            </div>
          )}

          {log.training_type && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Dumbbell className="h-2.5 w-2.5" /> {log.training_type}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-3">
          <p className="text-xs text-muted-foreground">Sin datos de seguimiento</p>
          {!goal && (
            <p className="text-[10px] text-amber-600 mt-1">Sin plan nutricional configurado</p>
          )}
        </div>
      )}
    </motion.div>
  );
}

export function GymTrackingSummary({ gymId }: Props) {
  const { data: summaries = [], isLoading } = useGymTrackingSummary(gymId);
  const [detailClient, setDetailClient] = useState<{ id: string; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No hay clientes con datos de seguimiento</p>
        </CardContent>
      </Card>
    );
  }

  // Stats
  const totalClients = summaries.length;
  const withLogs = summaries.filter(s => s.logs_this_week > 0).length;
  const withGoal = summaries.filter(s => s.goal).length;
  const inactive = summaries.filter(s => s.logs_this_week === 0).length;

  // Sort: inactive first (need attention), then by days logged desc
  const sorted = [...summaries].sort((a, b) => {
    if (a.logs_this_week === 0 && b.logs_this_week > 0) return -1;
    if (b.logs_this_week === 0 && a.logs_this_week > 0) return 1;
    return b.logs_this_week - a.logs_this_week;
  });

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold">{totalClients}</p>
          <p className="text-[10px] text-muted-foreground">Total clientes</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{withLogs}</p>
          <p className="text-[10px] text-muted-foreground">Activos esta semana</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{inactive}</p>
          <p className="text-[10px] text-muted-foreground">Sin registros</p>
        </div>
        <div className="rounded-lg border p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{withGoal}</p>
          <p className="text-[10px] text-muted-foreground">Con plan activo</p>
        </div>
      </div>

      {/* Client cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map(client => (
          <ClientTrackingCard
            key={client.client_id}
            client={client}
            onViewDetail={() => setDetailClient({ id: client.client_id, name: client.full_name })}
          />
        ))}
      </div>

      {/* Detail dialog */}
      {detailClient && (
        <ClientProgressView
          clientId={detailClient.id}
          clientName={detailClient.name}
          open={!!detailClient}
          onOpenChange={(val) => { if (!val) setDetailClient(null); }}
        />
      )}
    </div>
  );
}
