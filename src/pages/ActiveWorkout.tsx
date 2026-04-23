import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useMyAssignedRoutines } from "@/hooks/useClientRoutines";
import { useSaveWorkoutSession, type WorkoutExercise } from "@/hooks/useWorkoutSessions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Check, Timer, ArrowRight, ArrowLeft, Trophy, ChevronRight } from "lucide-react";
import { getExerciseImage, Gender } from "@/lib/exerciseImages";
import { useProfile } from "@/hooks/useProfile";
import { useExerciseImageMap } from "@/hooks/useExerciseImages";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function ActiveWorkout() {
  const { id: routineId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const gender: Gender = (profile?.gender as Gender) || "neutral";
  const uploadedImageMap = useExerciseImageMap();
  
  // NOTE: Correctly querying the client-assigned routines
  const { data: workouts = [] } = useMyAssignedRoutines();
  const routine = workouts.find((r) => r.id === routineId);
  const saveSession = useSaveWorkoutSession();

  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [setsData, setSetsData] = useState<Partial<WorkoutExercise>[]>([]);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  
  const [restTimer, setRestTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    if (!workoutStartTime) setWorkoutStartTime(Date.now());
  }, []);

  // Timer tick
  useEffect(() => {
    let interval: any;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => setRestTimer(prev => prev - 1), 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      toast.info("¡Descanso terminado! Es hora de volver a la acción.");
      // Native vibe vibration if available
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const activeExercise = routine?.exercises[activeExerciseIndex];
  
  // Initialize current exercise sets
  useEffect(() => {
    if (activeExercise) {
      const initialSets = Array(activeExercise.sets).fill(null).map((_, i) => ({
        exercise_name: activeExercise.name,
        sets: i + 1, // Store as the set number internally to distinguish
        reps: parseInt(activeExercise.reps) || 10,
        weight_kg: 0,
        rest_seconds: activeExercise.rest_seconds || 60,
        completed: false
      }));
      setSetsData(initialSets);
    }
  }, [activeExerciseIndex, activeExercise]);

  if (!routine) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">Cargando Rutina...</div>
      </DashboardLayout>
    );
  }

  const navigateExercise = (direction: 1 | -1) => {
    const newIndex = activeExerciseIndex + direction;
    if (newIndex >= 0 && newIndex < routine.exercises.length) {
      setActiveExerciseIndex(newIndex);
      setIsResting(false);
    }
  };

  const handleSetUpdate = (index: number, field: string, value: number) => {
    setSetsData(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const completeSet = (index: number) => {
    setSetsData(prev => prev.map((s, i) => i === index ? { ...s, completed: !s.completed } : s));
    
    // Start Rest Timer if completing...
    if (!setsData[index].completed) {
      setRestTimer(activeExercise?.rest_seconds || 60);
      setIsResting(true);
    } else {
      setIsResting(false);
      setRestTimer(0);
    }
  };

  const finishWorkout = () => {
    const durationMin = Math.round((Date.now() - (workoutStartTime || Date.now())) / 60000);
    
    // Aggregate muscle groups
    const muscles = [...new Set(routine.exercises.map(e => e.muscle_group).filter(Boolean))].join(' + ');

    // Aggregate exercises logically (just push the master exercises with total sets/reps)
    const formattedExercises: WorkoutExercise[] = routine.exercises.map((ex, i) => ({
      exercise_name: ex.name,
      sets: ex.sets,
      reps: parseInt(ex.reps) || 10,
      weight_kg: 0, // Simplified metric for average weight could go here
      rest_seconds: ex.rest_seconds || 60,
      sort_order: i
    }));

    saveSession.mutate({
      log_date: new Date().toISOString().split('T')[0],
      muscle_groups: muscles || "General",
      duration_min: durationMin,
      exercises: formattedExercises
    }, {
      onSuccess: () => {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        toast.success("¡Entrenamiento guardado con éxito!");
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    });
  };

  const isLastExercise = activeExerciseIndex === routine.exercises.length - 1;
  const imageUrl = activeExercise ? (uploadedImageMap.get(activeExercise.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim()) || getExerciseImage(activeExercise.name, activeExercise.muscle_group || 'General', gender)) : '';

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto h-full min-h-[85vh] flex flex-col relative space-y-4">
        {/* Header Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-border/40">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Entrenamiento Activo</p>
            <h1 className="text-2xl font-black font-display">{routine.name}</h1>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold text-muted-foreground">{activeExerciseIndex + 1} / {routine.exercises.length}</span>
            <div className="w-24 h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <motion.div 
                className="h-full gradient-primary" 
                layoutId="progress" 
                initial={false} 
                animate={{ width: `${((activeExerciseIndex + 1) / routine.exercises.length) * 100}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Rest Timer Visualizer Overlay */}
        <AnimatePresence>
          {isResting && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="sticky top-4 z-50 bg-black border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-neon backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <Timer className="h-6 w-6 text-energy animate-pulse" />
                <div>
                  <p className="text-xs font-bold text-white/50 uppercase tracking-wider">Descanso</p>
                  <p className="text-2xl font-black font-display text-white">{Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</p>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setIsResting(false)} className="text-white hover:bg-white/10">Omitir</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {activeExercise && (
          <motion.div 
            key={activeExerciseIndex} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 space-y-6"
          >
            {/* Visual Header */}
            <div className="relative rounded-3xl overflow-hidden h-64 border border-border/50 bg-card/50 shadow-xl">
              <img src={imageUrl} className="w-full h-full object-contain p-4 mix-blend-screen opacity-90" alt={activeExercise.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6">
                <span className="px-2 py-1 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase backdrop-blur-md mb-2 inline-block">
                  {activeExercise.muscle_group || 'General'}
                </span>
                <h2 className="text-3xl font-black font-display leading-none">{activeExercise.name}</h2>
              </div>
            </div>

            {/* Coach Target */}
            <div className="flex gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
              <Trophy className="h-8 w-8 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Objetivo de Set</p>
                <p className="text-sm font-medium mt-1">Haz <strong className="text-primary">{activeExercise.sets} series</strong> de <strong className="text-primary">{activeExercise.reps} reps</strong>.</p>
                {activeExercise.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{activeExercise.notes}"</p>}
              </div>
            </div>

            {/* Sets interactivos */}
            <div className="space-y-3">
              {setsData.map((set, i) => (
                <div key={i} className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${set.completed as boolean ? 'bg-success/10 border-success/30' : 'bg-card border-border/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${set.completed as boolean ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                      {set.completed as boolean ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Reps</p>
                      <Input type="number" className="w-16 h-8 text-center" value={set.reps} onChange={(e) => handleSetUpdate(i, 'reps', parseInt(e.target.value) || 0)} disabled={set.completed as boolean} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Peso (kg)</p>
                      <Input type="number" className="w-16 h-8 text-center" value={set.weight_kg} onChange={(e) => handleSetUpdate(i, 'weight_kg', parseFloat(e.target.value) || 0)} disabled={set.completed as boolean} />
                    </div>
                  </div>

                  <Button 
                    variant={set.completed as boolean ? "ghost" : "outline"} 
                    className={set.completed as boolean ? "text-success hover:bg-success/20 w-12" : "border-primary/50 text-primary w-12"}
                    onClick={() => completeSet(i)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer Navigation Controls */}
        <div className="pt-6 mt-auto flex gap-4">
          <Button variant="outline" size="lg" className="flex-1 h-14" disabled={activeExerciseIndex === 0} onClick={() => navigateExercise(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
          </Button>
          
          {!isLastExercise ? (
            <Button variant="premium" size="lg" className="flex-[2] h-14" onClick={() => navigateExercise(1)}>
              Siguiente Ejercicio <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button variant="premium" size="lg" className="flex-[2] h-14 bg-energy hover:bg-energy/90 text-black shadow-[0_0_20px_rgba(255,190,11,0.4)]" onClick={finishWorkout} disabled={saveSession.isPending}>
              {saveSession.isPending ? 'Guardando...' : 'FINALIZAR ENTRENAMIENTO'}
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
