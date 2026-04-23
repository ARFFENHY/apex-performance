import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Zap, Target, TrendingUp, Loader2, RotateCcw, ChevronDown, Clock, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
  useRoutineGenerator,
  type Objetivo,
  type Nivel,
  type GeneratedDay,
  type MuscleBlock,
  type GeneratedExercise,
} from "@/hooks/useRoutineGenerator";
import { useSaveAIRoutine } from "@/hooks/useSaveAIRoutine";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Save, CheckCircle } from "lucide-react";

const OBJETIVOS: { value: Objetivo; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "fuerza", label: "Fuerza", icon: <Weight className="h-5 w-5" />, desc: "Peso máximo, pocas reps" },
  { value: "hipertrofia", label: "Hipertrofia", icon: <Dumbbell className="h-5 w-5" />, desc: "Volumen muscular óptimo" },
  { value: "resistencia", label: "Resistencia", icon: <Zap className="h-5 w-5" />, desc: "Alta intensidad, muchas reps" },
];

const NIVELES: { value: Nivel; label: string; color: string }[] = [
  { value: "principiante", label: "Principiante", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  { value: "intermedio", label: "Intermedio", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  { value: "avanzado", label: "Avanzado", color: "bg-red-500/10 text-red-600 border-red-500/20" },
];

const muscleEmoji: Record<string, string> = {
  pecho: "🫁",
  espalda: "🔙",
  piernas: "🦵",
  hombros: "💪",
  biceps: "💪",
  triceps: "💪",
  abdomen: "🔥",
};

function ExerciseRow({ exercise, index }: { exercise: GeneratedExercise; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="flex items-center gap-3 rounded-lg bg-accent/40 px-4 py-3 hover:bg-accent/60 transition-colors"
    >
      <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{index + 1}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{exercise.nombre}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Target className="h-3 w-3" /> {exercise.series} × {exercise.reps}
          </span>
          <span className="flex items-center gap-1">
            <Weight className="h-3 w-3" /> {exercise.peso_sugerido}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {exercise.descanso_seg}s descanso
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function MuscleBlockCard({ block }: { block: MuscleBlock }) {
  const emoji = muscleEmoji[block.musculo] || "🏋️";
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
          {block.musculo}
        </h4>
        <Badge variant="secondary" className="text-[10px] h-5">
          {block.ejercicios.length} ejercicios
        </Badge>
      </div>
      <div className="space-y-1.5">
        {block.ejercicios.map((ex, idx) => (
          <ExerciseRow key={ex.nombre + idx} exercise={ex} index={idx} />
        ))}
      </div>
    </div>
  );
}

function DayCard({ day, index }: { day: GeneratedDay; index: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const totalExercises = day.bloques.reduce((sum, b) => sum + b.ejercicios.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="overflow-hidden border-border/60">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-accent/30 transition-colors pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    {day.dia.replace("Día ", "")}
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{day.nombre}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {totalExercises} ejercicios · {day.bloques.map((b) => b.musculo).join(", ")}
                    </p>
                  </div>
                </div>
                <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-5">
              {day.bloques.map((block, idx) => (
                <MuscleBlockCard key={block.musculo + idx} block={block} />
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}

export function RoutineGenerator() {
  const [objetivo, setObjetivo] = useState<Objetivo>("hipertrofia");
  const [nivel, setNivel] = useState<Nivel>("intermedio");
  const [dias, setDias] = useState(4);
  const { routine, isLoading, generate, clear } = useRoutineGenerator();
  const saveAIRoutine = useSaveAIRoutine();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [programName, setProgramName] = useState("");

  const handleGenerate = () => generate(objetivo, nivel, dias);

  const openSaveDialog = () => {
    setProgramName(`Rutina IA — ${routine?.objetivo} ${routine?.nivel}`);
    setSaveDialogOpen(true);
  };

  const handleSave = async () => {
    if (!routine || !programName.trim()) return;
    await saveAIRoutine.mutateAsync({ routine, programName: programName.trim() });
    setSaveDialogOpen(false);
    clear();
  };

  return (
    <div className="space-y-6">
      {/* ── Configuración ── */}
      <Card className="border-primary/20 bg-primary/[0.02]">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-display">Generador de Rutinas Pro</CardTitle>
              <p className="text-xs text-muted-foreground">Configura tu rutina personalizada</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Objetivo */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objetivo</Label>
            <div className="grid grid-cols-3 gap-2">
              {OBJETIVOS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => setObjetivo(o.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all text-center",
                    objetivo === o.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border hover:border-primary/40 text-muted-foreground"
                  )}
                >
                  {o.icon}
                  <span className="text-xs font-bold">{o.label}</span>
                  <span className="text-[10px] leading-tight opacity-70">{o.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nivel + Días */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nivel</Label>
              <Select value={nivel} onValueChange={(v) => setNivel(v as Nivel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NIVELES.map((n) => (
                    <SelectItem key={n.value} value={n.value}>
                      <span className="flex items-center gap-2">
                        <span className={cn("inline-block w-2 h-2 rounded-full", n.color.split(" ")[0])} />
                        {n.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Días / semana</Label>
              <Select value={String(dias)} onValueChange={(v) => setDias(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {d} días
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1 gradient-primary text-primary-foreground gap-2 h-11"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" /> Generar Rutina
                </>
              )}
            </Button>
            {routine && (
              <Button variant="outline" size="icon" className="h-11 w-11" onClick={clear}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Rutina generada ── */}
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 gap-3"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generando rutina profesional...</p>
          </motion.div>
        )}

        {!isLoading && routine && (
          <motion.div
            key="routine"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Summary bar */}
            <div className="flex flex-wrap gap-2 items-center">
              <Badge className="gradient-primary text-primary-foreground capitalize">{routine.objetivo}</Badge>
              <Badge variant="outline" className="capitalize">{routine.nivel}</Badge>
              <Badge variant="secondary">{routine.dias_semana} días/semana</Badge>
              <span className="text-xs text-muted-foreground">
                {routine.rutina.reduce((s, d) => s + d.bloques.reduce((s2, b) => s2 + b.ejercicios.length, 0), 0)} ejercicios totales
              </span>
              <Button
                size="sm"
                className="ml-auto gap-1.5 gradient-success text-primary-foreground"
                onClick={openSaveDialog}
                disabled={saveAIRoutine.isPending}
              >
                <Save className="h-3.5 w-3.5" /> Guardar como Programa
              </Button>
            </div>

            {/* Day cards */}
            <div className="space-y-4">
              {routine.rutina.map((day, idx) => (
                <DayCard key={day.dia} day={day} index={idx} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" /> Guardar Rutina IA
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-sm">Nombre del programa</Label>
            <Input
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="Ej: Hipertrofia Avanzada 4 días"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
              Se creará un programa con {routine?.rutina.length} rutinas y{" "}
              {routine?.rutina.reduce((s, d) => s + d.bloques.reduce((s2, b) => s2 + b.ejercicios.length, 0), 0)} ejercicios marcados como generados por IA.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancelar</Button>
            <Button
              className="gradient-primary text-primary-foreground gap-1.5"
              onClick={handleSave}
              disabled={saveAIRoutine.isPending || !programName.trim()}
            >
              {saveAIRoutine.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                <><CheckCircle className="h-4 w-4" /> Guardar</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
