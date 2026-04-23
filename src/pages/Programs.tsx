import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, FolderOpen, Trash2, Pencil, MoreHorizontal, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { usePrograms, useDeleteProgram, type Program } from "@/hooks/usePrograms";
import { CreateProgramDialog } from "@/components/CreateProgramDialog";
import { WorkoutManager } from "@/components/WorkoutManager";
import { ExerciseManager } from "@/components/ExerciseManager";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type View =
  | { level: "programs" }
  | { level: "workouts"; programId: string; programName: string }
  | { level: "exercises"; programId: string; workoutId: string; workoutName: string };

const Programs = () => {
  const { data: programs = [], isLoading } = usePrograms();
  const deleteMutation = useDeleteProgram();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>({ level: "programs" });
  const [editProgram, setEditProgram] = useState<Program | null>(null);

  const filtered = programs.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (view.level === "exercises") {
    return (
      <DashboardLayout>
        <ExerciseManager
          workoutId={view.workoutId}
          workoutName={view.workoutName}
          onBack={() => setView({ level: "workouts", programId: view.programId, programName: "" })}
        />
      </DashboardLayout>
    );
  }

  if (view.level === "workouts") {
    return (
      <DashboardLayout>
        <WorkoutManager
          programId={view.programId}
          programName={view.programName}
          onSelectWorkout={(wId, wName) =>
            setView({ level: "exercises", programId: view.programId, workoutId: wId, workoutName: wName })
          }
          onBack={() => setView({ level: "programs" })}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display">Programas</h1>
            <p className="text-sm text-muted-foreground mt-1">{programs.length} programas creados</p>
          </div>
          <CreateProgramDialog
            trigger={
              <Button className="gradient-primary text-primary-foreground shadow-primary hover:opacity-90 gap-2">
                <Plus className="h-4 w-4" /> Nuevo Programa
              </Button>
            }
          />
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar programa..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl bg-card p-10 shadow-card text-center">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">
              {search ? "No se encontraron programas" : "Crea tu primer programa de entrenamiento"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((program) => (
              <motion.div
                key={program.id}
                whileHover={{ y: -2 }}
                className="rounded-xl bg-card p-5 shadow-card hover:shadow-card-hover transition-shadow cursor-pointer"
                onClick={() => setView({ level: "workouts", programId: program.id, programName: program.name })}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-sm transition-colors duration-300 ${
                      program.level === 'principiante' ? 'bg-emerald-500 shadow-emerald-500/20' :
                      program.level === 'intermedio' ? 'bg-sky-500 shadow-sky-500/20' :
                      program.level === 'avanzado' ? 'bg-rose-500 shadow-rose-500/20' :
                      'gradient-primary shadow-primary/20'
                    }`}>
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-semibold text-sm">{program.name}</p>
                        {program.is_template && (
                          <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 px-1 py-0 h-4 text-[9px] gap-0.5">
                            <ShieldCheck className="h-2.5 w-2.5" /> Oficial
                          </Badge>
                        )}
                        {program.level && (
                          <Badge 
                            variant="outline" 
                            className={`px-1 py-0 h-4 text-[9px] font-bold border-0 ${
                              program.level === 'principiante' ? 'bg-emerald-500/10 text-emerald-500' :
                              program.level === 'intermedio' ? 'bg-sky-500/10 text-sky-500' :
                              'bg-rose-500/10 text-rose-600'
                            }`}
                          >
                            {program.level.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{program.workout_count ?? 0} rutinas</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      {!program.is_template ? (
                        <>
                          <DropdownMenuItem onClick={() => setEditProgram(program)}>
                            <Pencil className="h-3.5 w-3.5 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(program.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-2" /> Eliminar
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem disabled className="text-[10px] text-muted-foreground">
                          Plantilla oficial protegida
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {program.description && (
                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{program.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {editProgram && (
          <CreateProgramDialog
            trigger={<span />}
            editProgram={editProgram}
            onClose={() => setEditProgram(null)}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Programs;
