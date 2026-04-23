import { DashboardLayout } from "@/components/DashboardLayout";
import { Clock, Dumbbell, Pencil, Trash2, MoreVertical, Search, X, Filter, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useRoutines, useUpdateRoutine, useDeleteRoutine, Routine } from "@/hooks/useRoutines";
import { useFavoriteRoutines, useToggleFavorite } from "@/hooks/useClientRoutines";
import { CreateRoutineDialog } from "@/components/CreateRoutineDialog";
import { AssignRoutineDialog } from "@/components/AssignRoutineDialog";
import { RoutineGenerator } from "@/components/RoutineGenerator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  Fuerza: "gradient-primary",
  Cardio: "gradient-energy",
  Movilidad: "gradient-success",
};

const CATEGORIES = ["Fuerza", "Cardio", "Movilidad", "HIIT", "Funcional"];
const MUSCLE_GROUPS = ["Pecho", "Espalda", "Pierna", "Hombro", "Bíceps", "Tríceps", "Abdomen", "Glúteo", "Core", "Cuerpo completo"];

function EditRoutineDialog({ routine, open, onOpenChange }: { routine: Routine; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState(routine.name);
  const [description, setDescription] = useState(routine.description || "");
  const [category, setCategory] = useState(routine.category);
  const [duration, setDuration] = useState(routine.duration_minutes);
  const updateRoutine = useUpdateRoutine();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await updateRoutine.mutateAsync({
        id: routine.id,
        name: name.trim().slice(0, 100),
        description: description.trim().slice(0, 500) || undefined,
        category,
        duration_minutes: Math.max(1, Math.min(300, duration)),
      });
      toast.success("Rutina actualizada");
      onOpenChange(false);
    } catch {
      toast.error("Error al actualizar la rutina");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Editar Rutina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
              <Label>Duración (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} max={300} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} rows={2} />
          </div>
          <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={updateRoutine.isPending}>
            {updateRoutine.isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RoutineDetailDialog({ routine, open, onOpenChange }: { routine: Routine; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{routine.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {routine.description && (
            <p className="text-sm text-muted-foreground">{routine.description}</p>
          )}
          <div className="flex gap-3 text-xs text-muted-foreground">
            <Badge variant="secondary">{routine.category}</Badge>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {routine.duration_minutes} min</span>
            <span className="flex items-center gap-1"><Dumbbell className="h-3 w-3" /> {routine.exercises.length} ejercicios</span>
          </div>

          {routine.exercises.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Ejercicios</Label>
              {routine.exercises.map((ex, idx) => (
                <div key={ex.id} className="rounded-lg bg-accent/50 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono w-5">{idx + 1}.</span>
                      <span className="text-sm font-medium">{ex.name}</span>
                    </div>
                    {ex.muscle_group && (
                      <Badge variant="outline" className="text-[10px] h-5">{ex.muscle_group}</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1.5 ml-7 text-xs text-muted-foreground">
                    <span>{ex.sets} series</span>
                    <span>{ex.reps} reps</span>
                    <span>{ex.rest_seconds}s descanso</span>
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-muted-foreground mt-1 ml-7 italic">{ex.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const Routines = () => {
  const { data: routines = [], isLoading } = useRoutines();
  const { data: favoriteIds = new Set<string>() } = useFavoriteRoutines();
  const toggleFavorite = useToggleFavorite();
  const deleteRoutine = useDeleteRoutine();
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [viewingRoutine, setViewingRoutine] = useState<Routine | null>(null);
  const [assigningRoutine, setAssigningRoutine] = useState<Routine | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMuscle, setFilterMuscle] = useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filteredRoutines = useMemo(() => {
    let result = routines;

    if (showFavoritesOnly) {
      result = result.filter((r) => favoriteIds.has(r.id));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.exercises.some((ex) => ex.name.toLowerCase().includes(q) || ex.muscle_group?.toLowerCase().includes(q))
      );
    }

    if (filterMuscle && filterMuscle !== "all") {
      result = result.filter((r) =>
        r.exercises.some((ex) => ex.muscle_group === filterMuscle)
      );
    }

    return result;
  }, [routines, searchQuery, filterMuscle, showFavoritesOnly, favoriteIds]);

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteRoutine.mutateAsync(deletingId);
      toast.success("Rutina eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
    setDeletingId(null);
  };

  const handleToggleFavorite = (e: React.MouseEvent, routineId: string) => {
    e.stopPropagation();
    const isFav = favoriteIds.has(routineId);
    toggleFavorite.mutate(
      { routineId, isFavorite: isFav },
      {
        onSuccess: () => toast.success(isFav ? "Eliminado de favoritos" : "Agregado a favoritos ⭐"),
      }
    );
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Rutinas</h1>
            <p className="text-sm text-muted-foreground mt-1">Crea y gestiona rutinas profesionales</p>
          </div>
          <CreateRoutineDialog />
        </div>

        <Tabs defaultValue="generator" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">🚀 Generador Pro</TabsTrigger>
            <TabsTrigger value="list">📋 Mis Rutinas ({routines.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="mt-6">
            <RoutineGenerator />
          </TabsContent>

          <TabsContent value="list" className="mt-6 space-y-4">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar rutinas, ejercicios o grupo muscular..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                {searchQuery && (
                  <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setSearchQuery("")}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant={showFavoritesOnly ? "default" : "outline"}
                  size="sm"
                  className={cn("gap-1.5", showFavoritesOnly && "gradient-primary text-primary-foreground")}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                  <Star className={cn("h-3.5 w-3.5", showFavoritesOnly && "fill-current")} />
                  Favoritos
                </Button>
                <Select value={filterMuscle} onValueChange={setFilterMuscle}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    <SelectValue placeholder="Grupo muscular" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los grupos</SelectItem>
                    {MUSCLE_GROUPS.map((mg) => <SelectItem key={mg} value={mg}>{mg}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredRoutines.length === 0 ? (
              <div className="rounded-xl bg-card p-10 shadow-card text-center">
                <p className="text-muted-foreground text-sm">
                  {routines.length === 0
                    ? "Aún no has creado rutinas. Crea tu primera rutina para asignarla a tus clientes."
                    : showFavoritesOnly
                      ? "No tienes rutinas en favoritos."
                      : "No se encontraron rutinas con los filtros actuales."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRoutines.map((routine) => {
                  const isFav = favoriteIds.has(routine.id);
                  return (
                    <motion.div
                      key={routine.id}
                      whileHover={{ y: -2 }}
                      className="rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow overflow-hidden cursor-pointer"
                      onClick={() => setViewingRoutine(routine)}
                    >
                      <div className={`h-2 ${categoryColors[routine.category] || "gradient-primary"}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              {routine.category}
                            </span>
                            <h3 className="text-sm font-bold mt-1 truncate">{routine.name}</h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className={cn("h-8 w-8", isFav ? "text-amber-500" : "text-muted-foreground")}
                              onClick={(e) => handleToggleFavorite(e, routine.id)}
                            >
                              <Star className={cn("h-4 w-4", isFav && "fill-current")} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setAssigningRoutine(routine); }}>
                                  <Users className="h-3.5 w-3.5 mr-2" /> Asignar a clientes
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingRoutine(routine); }}>
                                  <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeletingId(routine.id); }}>
                                  <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {routine.exercises.some((ex) => ex.muscle_group) && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {[...new Set(routine.exercises.map((ex) => ex.muscle_group).filter(Boolean))].map((mg) => (
                              <Badge key={mg} variant="outline" className="text-[9px] h-4 px-1.5">{mg}</Badge>
                            ))}
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Dumbbell className="h-3.5 w-3.5" /> {routine.exercises.length} ejercicios
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {routine.duration_minutes} min
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {editingRoutine && (
        <EditRoutineDialog
          routine={editingRoutine}
          open={!!editingRoutine}
          onOpenChange={(o) => !o && setEditingRoutine(null)}
        />
      )}

      {viewingRoutine && (
        <RoutineDetailDialog
          routine={viewingRoutine}
          open={!!viewingRoutine}
          onOpenChange={(o) => !o && setViewingRoutine(null)}
        />
      )}

      <AssignRoutineDialog
        routine={assigningRoutine}
        open={!!assigningRoutine}
        onOpenChange={(o) => !o && setAssigningRoutine(null)}
      />

      <AlertDialog open={!!deletingId} onOpenChange={(o) => !o && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rutina?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminarán también los ejercicios asociados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Routines;
