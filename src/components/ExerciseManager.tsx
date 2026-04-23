import { useState } from "react";
import { useExercises, useCreateExercise, useDeleteExercise, type Exercise } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Play, Sparkles, Timer, Repeat } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseAnimationModal } from "@/components/ExerciseAnimationModal";

interface Props {
  workoutId: string;
  workoutName: string;
  onBack: () => void;
}

export function ExerciseManager({ workoutId, workoutName, onBack }: Props) {
  const { data: exercises = [], isLoading } = useExercises(workoutId);
  const createMutation = useCreateExercise();
  const deleteMutation = useDeleteExercise();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [animationExercise, setAnimationExercise] = useState<Exercise | null>(null);
  const [form, setForm] = useState({ name: "", sets: 3, reps: 10, rest_seconds: 60, animation_url: "" });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await createMutation.mutateAsync({
      workout_id: workoutId,
      name: form.name,
      sets: form.sets,
      reps: form.reps,
      rest_seconds: form.rest_seconds,
      order_index: exercises.length,
      animation_url: form.animation_url || null,
      ai_generated: false,
    });
    setForm({ name: "", sets: 3, reps: 10, rest_seconds: 60, animation_url: "" });
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          ← Rutinas
        </Button>
        <h2 className="text-lg font-bold font-display">{workoutName}</h2>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{exercises.length} ejercicios</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground gap-1">
              <Plus className="h-3.5 w-3.5" /> Agregar Ejercicio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo Ejercicio</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-1.5">
                <Label>Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Press de banca" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label>Series</Label>
                  <Input type="number" min={1} value={form.sets} onChange={(e) => setForm({ ...form, sets: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Reps</Label>
                  <Input type="number" min={1} value={form.reps} onChange={(e) => setForm({ ...form, reps: +e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Descanso (s)</Label>
                  <Input type="number" min={0} value={form.rest_seconds} onChange={(e) => setForm({ ...form, rest_seconds: +e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>URL Animación (opcional)</Label>
                <Input value={form.animation_url} onChange={(e) => setForm({ ...form, animation_url: e.target.value })} placeholder="https://... .gif / .mp4 / .glb" />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={createMutation.isPending}>
                Agregar Ejercicio
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="rounded-xl bg-card p-8 shadow-card text-center">
          <Repeat className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Agrega el primer ejercicio a esta rutina</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-3">
            {exercises.map((ex, idx) => (
              <motion.div
                key={ex.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-sm">{ex.name}</p>
                        {ex.ai_generated && (
                          <Sparkles className="h-3.5 w-3.5 text-energy" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-0.5"><Repeat className="h-3 w-3" /> {ex.sets}×{ex.reps}</span>
                        <span className="flex items-center gap-0.5"><Timer className="h-3 w-3" /> {ex.rest_seconds}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {ex.animation_url && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => setAnimationExercise(ex)}
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteMutation.mutate({ id: ex.id, workout_id: workoutId })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {animationExercise && (
        <ExerciseAnimationModal
          exercise={animationExercise}
          onClose={() => setAnimationExercise(null)}
        />
      )}
    </div>
  );
}
