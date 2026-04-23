import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Activity, Plus, Loader2, TrendingUp, Dumbbell, Flame } from "lucide-react";
import { useClientProgressLogs, useExerciseProgressChart, type ProgressLog } from "@/hooks/useProgressLogs";
import { useClientWorkouts, useUpdateAssignmentStatus, useUnassignProgram, type ClientWorkout } from "@/hooks/useClientWorkouts";
import { ClientDailyTrackingTab } from "@/components/ClientDailyTrackingTab";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface ClientProgressViewProps {
  clientId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusColors: Record<string, string> = {
  activo: "bg-success/10 text-success border-success/20",
  pausado: "bg-energy/10 text-energy border-energy/20",
  completado: "bg-primary/10 text-primary border-primary/20",
};

export function ClientProgressView({ clientId, clientName, open, onOpenChange }: ClientProgressViewProps) {
  const { data: logs = [], isLoading: loadingLogs } = useClientProgressLogs(open ? clientId : null);
  const { data: assignments = [], isLoading: loadingAssignments } = useClientWorkouts(clientId);
  const updateStatus = useUpdateAssignmentStatus();
  const unassign = useUnassignProgram();

  // Get unique exercise names for chart filter
  const exerciseNames = [...new Set(logs.map((l) => l.exercise_name))];
  const [selectedExercise, setSelectedExercise] = useState<string>("");

  const chartExercise = selectedExercise || exerciseNames[0] || null;
  const { data: chartData = [] } = useExerciseProgressChart(open ? clientId : null, chartExercise);

  const formattedChartData = chartData.map((d) => ({
    fecha: format(new Date(d.created_at), "dd/MM"),
    peso: d.weight,
    reps: d.reps,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Progreso de {clientName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="training" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="training" className="gap-1.5 text-xs">
              <Dumbbell className="h-3.5 w-3.5" /> Entrenamiento
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-1.5 text-xs">
              <Flame className="h-3.5 w-3.5" /> Seguimiento Diario
            </TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-4 mt-4">
            {/* Assigned Programs */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Programas Asignados</Label>
              {loadingAssignments ? (
                <Skeleton className="h-16 rounded-lg" />
              ) : assignments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">Sin programas asignados</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map((a) => (
                    <motion.div
                      key={a.id}
                      layout
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <div>
                          <p className="text-sm font-medium">{a.program_name}</p>
                          <p className="text-[10px] text-muted-foreground">Desde {format(new Date(a.start_date), "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={a.status}
                          onValueChange={(val) => updateStatus.mutate({ id: a.id, status: val as any })}
                        >
                          <SelectTrigger className="h-7 w-28 text-[10px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="activo">Activo</SelectItem>
                            <SelectItem value="pausado">Pausado</SelectItem>
                            <SelectItem value="completado">Completado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] text-destructive hover:text-destructive"
                          onClick={() => unassign.mutate(a.id)}
                        >
                          Quitar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Chart */}
            {exerciseNames.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Evolución por Ejercicio
                  </Label>
                  <Select value={chartExercise || ""} onValueChange={setSelectedExercise}>
                    <SelectTrigger className="h-8 w-48 text-xs">
                      <SelectValue placeholder="Ejercicio" />
                    </SelectTrigger>
                    <SelectContent>
                      {exerciseNames.map((name) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {formattedChartData.length > 1 ? (
                  <div className="rounded-lg border p-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={formattedChartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                        <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
                        <Line type="monotone" dataKey="reps" name="Reps" stroke="hsl(var(--success))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--success))" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Se necesitan al menos 2 registros para mostrar el gráfico.
                  </p>
                )}
              </div>
            )}

            {/* Recent Logs */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Historial Reciente ({logs.length})
              </Label>
              {loadingLogs ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
                </div>
              ) : logs.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Sin registros de progreso aún</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {logs.slice(0, 50).map((log) => (
                    <div key={log.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">{log.exercise_name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {log.weight != null && <Badge variant="secondary">{log.weight} kg</Badge>}
                        {log.reps != null && <Badge variant="outline">{log.reps} reps</Badge>}
                        {log.sets != null && <Badge variant="outline">{log.sets} sets</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="mt-4">
            <ClientDailyTrackingTab clientId={clientId} isOpen={open} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
