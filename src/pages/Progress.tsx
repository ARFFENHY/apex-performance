import { DashboardLayout } from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Scale, TrendingDown, Activity, Plus } from "lucide-react";
import { useBodyProgress, useAddBodyProgress } from "@/hooks/useBodyProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

const ProgressPage = () => {
  const { data: entries = [], isLoading } = useBodyProgress();
  const addProgress = useAddBodyProgress();
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [muscleMass, setMuscleMass] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const latest = entries.length > 0 ? entries[entries.length - 1] : null;
  const first = entries.length > 0 ? entries[0] : null;

  const weightDiff = latest && first ? (latest.weight - first.weight).toFixed(1) : null;
  const fatDiff = latest?.body_fat != null && first?.body_fat != null ? (latest.body_fat - first.body_fat).toFixed(1) : null;
  const muscleDiff = latest?.muscle_mass != null && first?.muscle_mass != null ? (latest.muscle_mass - first.muscle_mass).toFixed(1) : null;

  const chartData = entries.map((e, i) => ({
    label: format(new Date(e.date), "dd/MM"),
    peso: e.weight,
    grasa: e.body_fat,
    musculo: e.muscle_mass,
  }));

  const handleSubmit = async () => {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) {
      toast.error("Ingresa un peso válido");
      return;
    }
    const bf = bodyFat ? parseFloat(bodyFat) : undefined;
    const mm = muscleMass ? parseFloat(muscleMass) : undefined;

    try {
      await addProgress.mutateAsync({ weight: w, body_fat: bf, muscle_mass: mm, date });
      toast.success("Progreso registrado");
      setWeight("");
      setBodyFat("");
      setMuscleMass("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setOpen(false);
    } catch {
      toast.error("Error al guardar el progreso");
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Progreso Corporal</h1>
            <p className="text-sm text-muted-foreground mt-1">Seguimiento de composición corporal</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground shadow-primary hover:opacity-90 gap-2">
                <Plus className="h-4 w-4" /> Registrar Progreso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Registro de Progreso</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <Label>Fecha</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Peso (kg) *</Label>
                  <Input type="number" step="0.1" placeholder="80.5" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div>
                  <Label>Grasa corporal (%)</Label>
                  <Input type="number" step="0.1" placeholder="18.2" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} />
                </div>
                <div>
                  <Label>Masa muscular (kg)</Label>
                  <Input type="number" step="0.1" placeholder="35.4" value={muscleMass} onChange={(e) => setMuscleMass(e.target.value)} />
                </div>
                <Button onClick={handleSubmit} disabled={addProgress.isPending} className="w-full gradient-primary text-primary-foreground">
                  {addProgress.isPending ? "Guardando..." : "Guardar Registro"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-card p-5 shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Scale className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Peso Actual</span>
                </div>
                <p className="text-3xl font-bold font-display">{latest?.weight ?? "—"} kg</p>
                {weightDiff && (
                  <p className={`text-xs mt-1 ${parseFloat(weightDiff) <= 0 ? "text-success" : "text-energy"}`}>
                    {parseFloat(weightDiff) <= 0 ? "↓" : "↑"} {Math.abs(parseFloat(weightDiff))} kg desde el inicio
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-card p-5 shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-success" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Grasa Estimada</span>
                </div>
                <p className="text-3xl font-bold font-display">{latest?.body_fat != null ? `${latest.body_fat}%` : "—"}</p>
                {fatDiff && (
                  <p className={`text-xs mt-1 ${parseFloat(fatDiff) <= 0 ? "text-success" : "text-energy"}`}>
                    {parseFloat(fatDiff) <= 0 ? "↓" : "↑"} {Math.abs(parseFloat(fatDiff))}% desde el inicio
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-card p-5 shadow-card">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-9 w-9 rounded-lg bg-energy/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-energy" />
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Músculo Estimado</span>
                </div>
                <p className="text-3xl font-bold font-display">{latest?.muscle_mass != null ? `${latest.muscle_mass} kg` : "—"}</p>
                {muscleDiff && (
                  <p className={`text-xs mt-1 ${parseFloat(muscleDiff) >= 0 ? "text-primary" : "text-destructive"}`}>
                    {parseFloat(muscleDiff) >= 0 ? "↑" : "↓"} {Math.abs(parseFloat(muscleDiff))} kg desde el inicio
                  </p>
                )}
              </div>
            </div>

            {entries.length > 1 && (
              <div className="rounded-xl bg-card p-5 shadow-card">
                <h3 className="text-sm font-semibold font-display mb-4">Evolución de Peso</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Line type="monotone" dataKey="peso" name="Peso (kg)" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--success))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {entries.length === 0 && (
              <div className="rounded-xl bg-card p-10 shadow-card text-center">
                <p className="text-muted-foreground text-sm">
                  Aún no hay registros de progreso. Registra tu primer peso para comenzar el seguimiento.
                </p>
              </div>
            )}

            {entries.length >= 2 && (
              <div className="rounded-xl gradient-primary p-5 text-primary-foreground">
                <h3 className="font-display font-bold">📊 Resumen</h3>
                <p className="text-sm mt-2 text-white/90">
                  Tienes <strong>{entries.length}</strong> registros.
                  {weightDiff && <> Tu peso cambió <strong>{weightDiff} kg</strong> desde el inicio.</>}
                  {fatDiff && <> Grasa corporal: <strong>{fatDiff}%</strong>.</>}
                  {muscleDiff && <> Masa muscular: <strong>{muscleDiff} kg</strong>.</>}
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProgressPage;
