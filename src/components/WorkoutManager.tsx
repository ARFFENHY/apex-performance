import { useState } from "react";
import { useWorkouts, useCreateWorkout, useDeleteWorkout } from "@/hooks/useWorkouts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ChevronRight, Dumbbell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  programId: string;
  programName: string;
  onSelectWorkout: (workoutId: string, workoutName: string) => void;
  onBack: () => void;
}

export function WorkoutManager({ programId, programName, onSelectWorkout, onBack }: Props) {
  const { data: workouts = [], isLoading } = useWorkouts(programId);
  const createMutation = useCreateWorkout();
  const deleteMutation = useDeleteWorkout();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createMutation.mutateAsync({
      program_id: programId,
      name,
      day_order: workouts.length + 1,
    });
    setName("");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground">
          ← Programas
        </Button>
        <h2 className="text-lg font-bold font-display">{programName}</h2>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{workouts.length} rutinas</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gradient-primary text-primary-foreground gap-1">
              <Plus className="h-3.5 w-3.5" /> Agregar Rutina
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva Rutina</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la rutina</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Día 1 - Pecho y Tríceps" required />
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={createMutation.isPending}>
                Crear Rutina
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="rounded-xl bg-card p-8 shadow-card text-center">
          <Dumbbell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Agrega la primera rutina a este programa</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid gap-3">
            {workouts.map((w) => (
              <motion.div
                key={w.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-xl bg-card p-4 shadow-card hover:shadow-card-hover transition-shadow flex items-center justify-between group"
              >
                <button
                  onClick={() => onSelectWorkout(w.id, w.name)}
                  className="flex items-center gap-3 flex-1 text-left"
                >
                  <div className="h-9 w-9 rounded-lg gradient-success flex items-center justify-center text-success-foreground font-bold text-sm">
                    {w.day_order}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.exercise_count ?? 0} ejercicios</p>
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                    onClick={() => deleteMutation.mutate({ id: w.id, program_id: programId })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
