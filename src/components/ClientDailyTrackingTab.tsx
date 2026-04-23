import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientDailyLogs, useClientWeeklyLogs, useClientWeightHistory, useClientFitnessGoal } from "@/hooks/useClientDailyLogs";
import { Flame, Beef, Wheat, Droplets, GlassWater, Dumbbell, Scale, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";

interface Props {
  clientId: string;
  isOpen: boolean;
}

export function ClientDailyTrackingTab({ clientId, isOpen }: Props) {
  const { data: logs = [], isLoading } = useClientDailyLogs(isOpen ? clientId : null);
  const { data: weeklyLogs = [] } = useClientWeeklyLogs(isOpen ? clientId : null);
  const { data: weightHistory = [] } = useClientWeightHistory(isOpen ? clientId : null);
  const { data: goal } = useClientFitnessGoal(isOpen ? clientId : null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  const latestLog = logs[0] || null;

  const weekChartData = weeklyLogs.map(l => ({
    date: new Date(l.log_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }),
    Calorías: l.calories_consumed,
    Objetivo: goal?.calories || 0,
  }));

  const weightChartData = weightHistory.map(w => ({
    date: new Date(w.recorded_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
    Peso: w.weight,
  }));

  return (
    <div className="space-y-4">
      {/* Active goal summary */}
      {goal && (
        <div className="rounded-lg border p-3 space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Plan Activo: {goal.goal_type}
          </Label>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded bg-blue-50 dark:bg-blue-950/30 p-2">
              <p className="font-bold text-blue-600">{goal.calories}</p>
              <p className="text-muted-foreground">kcal</p>
            </div>
            <div className="rounded bg-red-50 dark:bg-red-950/30 p-2">
              <p className="font-bold text-red-600">{goal.protein}g</p>
              <p className="text-muted-foreground">Prot</p>
            </div>
            <div className="rounded bg-yellow-50 dark:bg-yellow-950/30 p-2">
              <p className="font-bold text-yellow-600">{goal.carbs}g</p>
              <p className="text-muted-foreground">Carbs</p>
            </div>
            <div className="rounded bg-green-50 dark:bg-green-950/30 p-2">
              <p className="font-bold text-green-600">{goal.fat}g</p>
              <p className="text-muted-foreground">Grasas</p>
            </div>
          </div>
        </div>
      )}

      {/* Latest daily log */}
      {latestLog ? (
        <div className="rounded-lg border p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Último registro
            </Label>
            <Badge variant="outline" className="text-[10px]">
              {new Date(latestLog.log_date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 rounded bg-accent/50 p-2">
              <Flame className="h-3.5 w-3.5 text-blue-500" />
              <div>
                <p className="text-sm font-bold">{latestLog.calories_consumed}</p>
                <p className="text-[10px] text-muted-foreground">kcal</p>
              </div>
              {goal && goal.calories > 0 && (
                <Progress value={Math.min((latestLog.calories_consumed / goal.calories) * 100, 100)} className="h-1.5 ml-auto w-16 [&>div]:bg-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-2 rounded bg-accent/50 p-2">
              <Beef className="h-3.5 w-3.5 text-red-500" />
              <div>
                <p className="text-sm font-bold">{latestLog.protein_consumed}g</p>
                <p className="text-[10px] text-muted-foreground">Proteína</p>
              </div>
              {goal && goal.protein > 0 && (
                <Progress value={Math.min((latestLog.protein_consumed / goal.protein) * 100, 100)} className="h-1.5 ml-auto w-16 [&>div]:bg-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2 rounded bg-accent/50 p-2">
              <Wheat className="h-3.5 w-3.5 text-yellow-500" />
              <div>
                <p className="text-sm font-bold">{latestLog.carbs_consumed}g</p>
                <p className="text-[10px] text-muted-foreground">Carbos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded bg-accent/50 p-2">
              <Droplets className="h-3.5 w-3.5 text-green-500" />
              <div>
                <p className="text-sm font-bold">{latestLog.fat_consumed}g</p>
                <p className="text-[10px] text-muted-foreground">Grasas</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <GlassWater className="h-3 w-3" /> {latestLog.water_liters}L agua
            </span>
            {latestLog.training_type && (
              <span className="flex items-center gap-1">
                <Dumbbell className="h-3 w-3" /> {latestLog.training_type} ({latestLog.training_duration_min} min)
              </span>
            )}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">
          Este cliente aún no tiene registros de seguimiento diario.
        </p>
      )}

      {/* Weekly calories chart */}
      {weekChartData.length > 1 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Calorías semanal
          </Label>
          <div className="rounded-lg border p-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={weekChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Bar dataKey="Calorías" fill="hsl(217, 91%, 60%)" radius={[3, 3, 0, 0]} />
                {goal && <Bar dataKey="Objetivo" fill="hsl(var(--muted))" radius={[3, 3, 0, 0]} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Weight history chart */}
      {weightChartData.length > 1 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Scale className="h-3 w-3" /> Evolución de peso
          </Label>
          <div className="rounded-lg border p-3">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={weightChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis domain={['auto', 'auto']} fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="Peso" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent logs list */}
      {logs.length > 1 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Historial ({logs.length} días)
          </Label>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {logs.map(log => (
              <div key={log.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
                <span className="font-medium">
                  {new Date(log.log_date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">{log.calories_consumed} kcal</Badge>
                  <Badge variant="outline" className="text-[10px]">{log.protein_consumed}g prot</Badge>
                  {log.training_type && (
                    <Badge variant="outline" className="text-[10px]">
                      <Dumbbell className="h-2.5 w-2.5 mr-1" />{log.training_type}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
