import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, GripVertical, Sparkles, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useExerciseSuggestions, SuggestedExercise } from "@/hooks/useExerciseSuggestions";
import { motion, AnimatePresence } from "framer-motion";

interface ExerciseInput {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes: string;
  muscle_group: string;
}

const CATEGORIES = ["Fuerza", "Cardio", "Movilidad", "HIIT", "Funcional"];
const MUSCLE_GROUPS = ["Pecho", "Espalda", "Pierna", "Hombro", "Bíceps", "Tríceps", "Abdomen", "Glúteo", "Core", "Cuerpo completo"];

function AISuggestionPanel({
  muscleGroup,
  category,
  onAddExercise,
}: {
  muscleGroup: string;
  category: string;
  onAddExercise: (ex: SuggestedExercise) => void;
}) {
  const { suggestions, isLoading, fetchSuggestions, clearSuggestions } = useExerciseSuggestions();
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());

  const handleFetch = () => {
    setAddedNames(new Set());
    fetchSuggestions(muscleGroup, category);
  };

  const handleAdd = (ex: SuggestedExercise) => {
    onAddExercise(ex);
    setAddedNames((prev) => new Set(prev).add(ex.name));
  };

  if (!muscleGroup) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-4 text-center">
        <Sparkles className="h-5 w-5 mx-auto text-muted-foreground/50 mb-1.5" />
        <p className="text-xs text-muted-foreground">
          Selecciona un grupo muscular en un ejercicio para obtener sugerencias con IA
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Sugerencias IA</span>
          <Badge variant="secondary" className="text-[10px] h-4">{muscleGroup}</Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={handleFetch}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {suggestions.length > 0 ? "Regenerar" : "Sugerir"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-4"
          >
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-xs text-muted-foreground ml-2">Generando sugerencias...</span>
          </motion.div>
        )}

        {!isLoading && suggestions.length > 0 && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-1.5"
          >
            {suggestions.map((ex, idx) => {
              const isAdded = addedNames.has(ex.name);
              return (
                <motion.div
                  key={ex.name + idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{ex.name}</span>
                    <span className="text-muted-foreground ml-2">
                      {ex.sets}×{ex.reps} · {ex.rest_seconds}s
                    </span>
                    {ex.notes && (
                      <p className="text-muted-foreground/70 text-[10px] mt-0.5 truncate italic">{ex.notes}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant={isAdded ? "secondary" : "default"}
                    size="sm"
                    className="h-6 px-2 text-[10px] shrink-0"
                    onClick={() => handleAdd(ex)}
                    disabled={isAdded}
                  >
                    {isAdded ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CreateRoutineDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Fuerza");
  const [duration, setDuration] = useState(45);
  
  const [exercises, setExercises] = useState<ExerciseInput[]>([
    { name: "", sets: 3, reps: "10", rest_seconds: 60, notes: "", muscle_group: "" },
  ]);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Detect last selected muscle group from exercises
  const lastMuscleGroup = [...exercises].reverse().find((ex) => ex.muscle_group)?.muscle_group || "";

  const addExercise = () => {
    if (exercises.length >= 20) return;
    setExercises([...exercises, { name: "", sets: 3, reps: "10", rest_seconds: 60, notes: "", muscle_group: "" }]);
  };

  const addSuggestedExercise = (suggested: SuggestedExercise) => {
    if (exercises.length >= 20) {
      toast.error("Máximo 20 ejercicios por rutina");
      return;
    }
    const newExercise: ExerciseInput = {
      name: suggested.name,
      sets: suggested.sets,
      reps: suggested.reps,
      rest_seconds: suggested.rest_seconds,
      notes: suggested.notes || "",
      muscle_group: lastMuscleGroup,
    };
    // Replace first empty exercise or append
    const emptyIdx = exercises.findIndex((ex) => !ex.name.trim());
    if (emptyIdx !== -1) {
      setExercises(exercises.map((ex, i) => (i === emptyIdx ? newExercise : ex)));
    } else {
      setExercises([...exercises, newExercise]);
    }
    toast.success(`"${suggested.name}" agregado`);
  };

  const removeExercise = (idx: number) => {
    if (exercises.length <= 1) return;
    setExercises(exercises.filter((_, i) => i !== idx));
  };

  const updateExercise = (idx: number, field: keyof ExerciseInput, value: string | number) => {
    setExercises(exercises.map((ex, i) => (i === idx ? { ...ex, [field]: value } : ex)));
  };

  const resetForm = () => {
    setName(""); setDescription(""); setCategory("Fuerza"); setDuration(45);
    setExercises([{ name: "", sets: 3, reps: "10", rest_seconds: 60, notes: "", muscle_group: "" }]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    const validExercises = exercises.filter((ex) => ex.name.trim());
    if (validExercises.length === 0) {
      toast.error("Agrega al menos un ejercicio con nombre");
      return;
    }

    setSaving(true);
    try {
      const { data: routine, error: routineError } = await supabase
        .from("routines")
        .insert({
          coach_id: user.id,
          name: name.trim().slice(0, 100),
          description: description.trim().slice(0, 500) || null,
          category,
          duration_minutes: Math.max(1, Math.min(300, duration)),
          video_url: null,
        })
        .select("id")
        .single();

      if (routineError) throw routineError;

      if (routine && validExercises.length > 0) {
        const { error: exError } = await supabase.from("routine_exercises").insert(
          validExercises.map((ex, idx) => ({
            routine_id: routine.id,
            name: ex.name.trim().slice(0, 100),
            sets: Math.max(1, Math.min(20, ex.sets)),
            reps: ex.reps.trim().slice(0, 20),
            rest_seconds: Math.max(0, Math.min(600, ex.rest_seconds)),
            order_index: idx,
            notes: ex.notes.trim() || null,
            muscle_group: ex.muscle_group || null,
          }))
        );
        if (exError) throw exError;
      }

      queryClient.invalidateQueries({ queryKey: ["routines"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard_stats"] });
      toast.success("Rutina creada exitosamente");
      resetForm();
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Error al crear la rutina");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-primary text-primary-foreground gap-2">
            <Plus className="h-4 w-4" /> Nueva Rutina
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Nueva Rutina</DialogTitle>
          <DialogDescription>Crea una rutina de entrenamiento con ejercicios.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="routine-name">Nombre</Label>
              <Input id="routine-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Full Body A" required maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Categoría</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="routine-duration">Duración (min)</Label>
              <Input id="routine-duration" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} max={300} />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="routine-desc">Descripción (opcional)</Label>
              <Textarea id="routine-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notas sobre la rutina..." maxLength={500} rows={2} />
            </div>
          </div>

          {/* AI Suggestions Panel */}
          <AISuggestionPanel
            muscleGroup={lastMuscleGroup}
            category={category}
            onAddExercise={addSuggestedExercise}
          />

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Ejercicios</Label>
              <Button type="button" variant="ghost" size="sm" className="text-xs text-primary gap-1 h-7" onClick={addExercise}>
                <Plus className="h-3 w-3" /> Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {exercises.map((ex, idx) => (
                <div key={idx} className="rounded-lg bg-accent/50 p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground mt-2.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      <div className="col-span-4 sm:col-span-2">
                        <Input placeholder="Nombre del ejercicio" value={ex.name} onChange={(e) => updateExercise(idx, "name", e.target.value)} maxLength={100} className="text-sm h-9" />
                      </div>
                      <Input type="number" placeholder="Series" value={ex.sets} onChange={(e) => updateExercise(idx, "sets", Number(e.target.value))} min={1} max={20} className="text-sm h-9" />
                      <div className="flex gap-1">
                        <Input placeholder="Reps" value={ex.reps} onChange={(e) => updateExercise(idx, "reps", e.target.value)} maxLength={20} className="text-sm h-9" />
                        {exercises.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive shrink-0" onClick={() => removeExercise(idx)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <Select value={ex.muscle_group} onValueChange={(v) => updateExercise(idx, "muscle_group", v)}>
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="Grupo muscular" />
                      </SelectTrigger>
                      <SelectContent>
                        {MUSCLE_GROUPS.map((mg) => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input placeholder="Notas (opcional)" value={ex.notes} onChange={(e) => updateExercise(idx, "notes", e.target.value)} maxLength={200} className="text-xs h-8 flex-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={saving}>
            {saving ? "Guardando..." : "Crear Rutina"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
