import { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dumbbell, Plus, Trash2, Save, BookOpen, Search, Clock, RotateCcw, ChevronDown, ChevronUp, CheckCircle2, Calendar, Flag, Trophy } from 'lucide-react';
import { useWorkoutSession, useSaveWorkoutSession, type WorkoutExercise } from '@/hooks/useWorkoutSessions';
import { EXERCISE_CATALOG, type ExerciseEntry } from '@/hooks/useExerciseCatalog';
import { useExerciseImageMap } from '@/hooks/useExerciseImages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';

const MUSCLE_GROUPS = [
  'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps', 
  'Piernas', 'Glúteos', 'Core', 'Pantorrillas', 'Antebrazos',
];

interface ExerciseSet {
  reps: number;
  weight_kg: number;
  rest_seconds: number;
}

interface LocalExercise extends Omit<WorkoutExercise, 'sets' | 'reps' | 'weight_kg' | 'rest_seconds'> {
  sets_data: ExerciseSet[];
  image_url?: string;
  description?: string;
  muscles?: string;
}

function ExerciseSearchDialog({ onSelect, onClose, initialMuscleFilter, open }: { onSelect: (ex: ExerciseEntry) => void, onClose: () => void, initialMuscleFilter?: string, open?: boolean }) {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState(initialMuscleFilter || "all");
  const { data: profile } = useProfile();
  const imageMap = useExerciseImageMap(profile?.gender || 'male');

  const filtered = useMemo(() => {
    return EXERCISE_CATALOG.filter(ex => {
      const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase()) || ex.muscles.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = muscleFilter === "all" || ex.muscle_group === muscleFilter;
      return matchSearch && matchMuscle;
    });
  }, [search, muscleFilter]);

  const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
      <DialogHeader className="p-6 bg-gradient-to-br from-primary/10 via-background to-background border-b border-primary/10">
        <DialogTitle className="text-2xl font-display font-black flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-primary" />
          </div>
          Biblioteca de Ejercicios
        </DialogTitle>
      </DialogHeader>

      <div className="p-4 bg-muted/30 border-b border-border/50 space-y-3">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar ejercicio..." 
              className="pl-9 h-11 bg-background border-primary/20 focus:border-primary shadow-sm"
            />
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap pb-2">
            <div className="flex gap-2">
              <Badge
                variant={muscleFilter === "all" ? "default" : "outline"}
                className={`cursor-pointer h-8 px-4 transition-all ${muscleFilter === "all" ? 'bg-primary' : 'text-muted-foreground hover:border-primary/50'}`}
                onClick={() => setMuscleFilter("all")}
              >
                Ver todo
              </Badge>
              {Array.from(new Set(EXERCISE_CATALOG.map(ex => ex.muscle_group))).sort().map(m => (
                <Badge
                  key={m}
                  variant={muscleFilter === m ? "default" : "outline"}
                  className={`cursor-pointer h-8 px-4 transition-all ${muscleFilter === m ? 'bg-primary border-primary' : 'text-muted-foreground hover:border-primary/50'}`}
                  onClick={() => setMuscleFilter(m)}
                >
                  {m}
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
          {filtered.map((ex) => {
            const imageUrl = imageMap.get(normalize(ex.name));
            return (
              <div 
                key={ex.name} 
                className="group relative rounded-2xl border bg-card hover:border-primary/50 hover:shadow-xl transition-all overflow-hidden cursor-pointer"
                onClick={() => {
                  onSelect(ex);
                  onClose();
                }}
              >
                <div className="relative h-32 overflow-hidden bg-muted/20">
                  {imageUrl ? (
                    <img src={imageUrl} alt={ex.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                      <Dumbbell className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="premium" size="sm" className="rounded-full font-bold shadow-lg">
                      <Plus className="h-4 w-4 mr-1" /> SELECCIONAR
                    </Button>
                  </div>
                  <div className="absolute bottom-2 left-3 right-3">
                    <Badge className="bg-primary hover:bg-primary text-[10px] font-bold border-none shadow-lg">
                      {ex.muscle_group}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 space-y-1">
                  <h4 className="font-bold text-sm leading-tight text-foreground line-clamp-1">{ex.name}</h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 italic">{ex.muscles}</p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </DialogContent>
    </Dialog>
  );
}

export function WorkoutLogger({ selectedDate, displayDate, onFinalizeChange, initialFinalized = false }: { selectedDate: string; displayDate: (d: string) => string; onFinalizeChange?: (finalized: boolean) => void; initialFinalized?: boolean }) {
  const { data: session, isLoading } = useWorkoutSession(selectedDate);
  const saveSession = useSaveWorkoutSession();
  const { data: profile } = useProfile();
  const imageMap = useExerciseImageMap(profile?.gender || 'male');

  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [exercises, setExercises] = useState<LocalExercise[]>([]);
  const [duration, setDuration] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTarget, setSearchTarget] = useState<number>(0);
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [collapsedExercises, setCollapsedExercises] = useState<Record<number, boolean>>({});
  const [isFinalized, setIsFinalized] = useState(initialFinalized);
  const [showDetails, setShowDetails] = useState(false);
  const lastReportedRef = useRef(initialFinalized);

  useEffect(() => {
    setIsFinalized(initialFinalized);
  }, [initialFinalized]);

  useEffect(() => {
    if (isFinalized !== lastReportedRef.current) {
      onFinalizeChange?.(isFinalized);
      lastReportedRef.current = isFinalized;
    }
  }, [isFinalized, onFinalizeChange]);

  useEffect(() => {
    if (session) {
      setMuscleGroups(session.muscle_groups ? session.muscle_groups.split(' + ').filter(Boolean) : []);
      setDuration(String(session.duration_min || ''));
      
      const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const grouped = new Map<string, LocalExercise>();
      
      (session.exercises || []).forEach(ex => {
        const catalogEx = EXERCISE_CATALOG.find(c => normalize(c.name) === normalize(ex.exercise_name));
        if (!grouped.has(ex.exercise_name)) {
          grouped.set(ex.exercise_name, {
            exercise_name: ex.exercise_name,
            sort_order: ex.sort_order,
            image_url: imageMap.get(normalize(ex.exercise_name)),
            description: catalogEx?.description,
            muscles: catalogEx?.muscles,
            sets_data: []
          });
        }
        const current = grouped.get(ex.exercise_name)!;
        current.sets_data.push({
          reps: ex.reps,
          weight_kg: ex.weight_kg,
          rest_seconds: ex.rest_seconds
        });
      });
      setExercises(Array.from(grouped.values()));
    } else {
      // Clear if no session
      setMuscleGroups([]);
      setExercises([]);
      setDuration('');
    }
  }, [session, imageMap]);

  useEffect(() => {
    setIsFinalized(initialFinalized);
  }, [selectedDate, initialFinalized]);

  const updateExercise = (index: number, field: string, value: any) => {
    setExercises(prev => prev.map((ex, i) => i === index ? { ...ex, [field]: value } : ex));
  };

  const updateExerciseSet = (exIndex: number, setIndex: number, field: keyof ExerciseSet, value: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      const newSets = [...ex.sets_data];
      newSets[setIndex] = { ...newSets[setIndex], [field]: value };
      return { ...ex, sets_data: newSets };
    }));
  };

  const addSet = (exIndex: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex) return ex;
      const lastSet = ex.sets_data[ex.sets_data.length - 1] || { reps: 10, weight_kg: 0, rest_seconds: 60 };
      return { ...ex, sets_data: [...ex.sets_data, { ...lastSet }] };
    }));
  };

  const removeSet = (exIndex: number, setIndex: number) => {
    setExercises(prev => prev.map((ex, i) => {
      if (i !== exIndex || ex.sets_data.length <= 1) return ex;
      return { ...ex, sets_data: ex.sets_data.filter((_, sIdx) => sIdx !== setIndex) };
    }));
  };

  const removeExercise = (index: number) => {
    setExercises(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (muscleGroups.length === 0) {
      toast.error('Selecciona al menos un grupo muscular');
      return;
    }
    const flattenedExercises: WorkoutExercise[] = [];
    exercises.forEach((ex, exIdx) => {
      if (!ex.exercise_name.trim()) return;
      ex.sets_data.forEach((set, setIdx) => {
        flattenedExercises.push({
          exercise_name: ex.exercise_name,
          sets: 1,
          reps: set.reps,
          weight_kg: set.weight_kg,
          rest_seconds: set.rest_seconds,
          sort_order: (exIdx * 100) + setIdx
        });
      });
    });
    const parsedDuration = parseInt(duration);
    saveSession.mutate({
      log_date: selectedDate,
      muscle_groups: muscleGroups.join(' + '),
      duration_min: !isNaN(parsedDuration) ? parsedDuration : undefined,
      exercises: flattenedExercises,
    });
  };

  const handleFinalize = () => {
    handleSave();
    setIsFinalized(true);
    toast.success('¡Entrenamiento del día finalizado!', { icon: '💪' });
  };

  if (isLoading && !muscleGroups.length && !exercises.length) {
    return <Card className="animate-pulse"><CardContent className="h-64" /></Card>;
  }

  return (
    <Card className="border-none shadow-2xl bg-gradient-to-b from-background to-muted/20">
      <div className="relative overflow-hidden rounded-t-[2rem] bg-slate-950 px-6 py-10 text-center min-h-[340px] flex flex-col justify-center">
        {/* Background decorative elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-energy/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10 space-y-3">
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-4xl md:text-5xl font-display font-black italic tracking-tighter text-white leading-none">
              ENTRENAMIENTO
            </h2>
            <div className="flex flex-col items-center gap-2 min-h-[60px] justify-center">
              <Badge className="bg-primary/20 text-primary border border-primary/30 font-black italic py-1 px-4 rounded-full text-[10px] mt-1">
                <Dumbbell className="h-3.5 w-3.5 mr-1.5" /> {exercises.length} EJERCICIOS REGISTRADOS
              </Badge>
              {isFinalized && (
                <Badge className="bg-[#00FF87] text-black border-0 shadow-xl shadow-[#00FF87]/20 font-black italic py-1 px-4 rounded-full text-[10px]">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> FINALIZADO
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm font-display font-black italic uppercase tracking-[0.2em] text-white/60">
            Planifica y registra tu sesión de hoy
          </p>
          
          <div className="pt-4 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Fecha de Sesión</span>
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-black text-white tracking-tighter capitalize">{displayDate(selectedDate)}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="space-y-8">
        {isFinalized && (
          <div className="pt-10 mt-0 space-y-6 animate-in zoom-in duration-700">
             <div className="bg-[#EFFFF6] border border-success/10 rounded-[3.5rem] p-12 text-center shadow-[0_20px_50px_rgba(0,255,135,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Trophy className="h-40 w-40 text-success -rotate-12 translate-x-12 -translate-y-12" />
                </div>
                <div className="relative z-10">
                  <div className="h-24 w-24 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Trophy className="h-12 w-12 text-success" />
                  </div>
                  <div className="min-h-[140px] flex flex-col justify-center">
                    <h4 className="text-5xl font-black italic text-success mb-4 tracking-tighter leading-none uppercase">¡MISIÓN CUMPLIDA!</h4>
                    <p className="text-sm text-muted-foreground font-black italic uppercase tracking-[0.2em] opacity-40">
                      Rendimiento registrado. Es hora de recuperar energías.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-success/10 min-h-[80px] flex items-center justify-center">
                    <p className="text-xs text-muted-foreground italic font-bold">
                      “Tu único límite es tu mente. ¡Sigue así!”
                    </p>
                  </div>
                </div>
             </div>
             <div className="pt-8 flex flex-col items-center gap-6 mb-10">
               <Button 
                 variant="outline"
                 className="h-12 px-10 rounded-full border-success/20 text-success font-black text-xs uppercase tracking-[0.3em] hover:bg-success/5 shadow-lg shadow-success/10"
                 onClick={() => setShowDetails(!showDetails)}
               >
                 {showDetails ? 'OCULTAR REGISTRO' : 'VER REGISTRO'}
               </Button>
                {!initialFinalized && (
                  <Button 
                    variant="ghost" 
                    className="font-black text-[11px] uppercase tracking-[0.3em] opacity-30 hover:opacity-100 transition-all"
                    onClick={() => setIsFinalized(false)}
                  >
                    EDITAR ENTRENAMIENTO
                  </Button>
                )}
             </div>
          </div>
        )}
        
        {!isFinalized && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grupos Musculares</label>
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-1.5 rounded-full border border-border/50">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <Input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Min" 
                  className="w-12 h-5 text-center bg-transparent border-none text-[10px] p-0 font-bold focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(m => {
                const active = muscleGroups.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={isFinalized}
                    onClick={() => setMuscleGroups(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-tight transition-all border-2 ${
                      active ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105' : 'bg-muted/30 border-transparent text-muted-foreground hover:border-primary/30'
                    } ${isFinalized ? 'cursor-not-allowed opacity-80' : ''}`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        )}

          {(isFinalized && showDetails || !isFinalized) && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  EJERCICIOS
                </h3>
                {!isFinalized && (
                  <Button 
                    variant="outline" size="sm" className="h-9 rounded-full border-primary/20 hover:border-primary hover:bg-primary/5 text-xs font-black"
                    onClick={() => {
                      if (!muscleGroups.length) { toast.error("Selecciona un grupo muscular primero"); return; }
                      setSearchTarget(exercises.length);
                      setSearchOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" /> AGREGAR
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                {exercises.map((ex, i) => {
                  const isDetailed = expandedDetails[i];
                  const isCollapsed = collapsedExercises[i];
                  return (
                    <div key={i} className={`rounded-3xl border border-border/40 p-5 space-y-4 bg-card shadow-sm transition-all duration-300 ${isCollapsed ? 'opacity-80 py-3' : ''}`}>
                      <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                        <button 
                          type="button" onClick={() => setCollapsedExercises(v => ({ ...v, [i]: !v[i] }))}
                          className="flex items-center gap-3 group"
                        >
                          <div className="h-6 w-6 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            {isCollapsed ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronUp className="h-3.5 w-3.5" />}
                          </div>
                          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors">
                            {isCollapsed ? 'DESPLEGAR' : 'CONTRAER'}
                          </span>
                        </button>
                        {isCollapsed && (
                          <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-[10px] font-black italic py-1 px-3 rounded-full">
                            {ex.sets_data?.length || 0} SERIES REGISTRADAS
                          </Badge>
                        )}
                      </div>

                      {!isCollapsed && (
                        <>
                          <div className="space-y-4">
                            <div className="flex gap-3 items-center">
                              <Input 
                                value={ex.exercise_name} 
                                onChange={e => updateExercise(i, 'exercise_name', e.target.value)}
                                placeholder="Nombre del ejercicio"
                                className="h-12 text-lg font-black italic tracking-tight bg-muted/20 border-none rounded-2xl"
                                disabled={isFinalized}
                              />
                              {!isFinalized && (
                                <Button variant="ghost" size="icon" onClick={() => removeExercise(i)} className="h-12 w-12 text-destructive hover:bg-destructive/5 rounded-2xl">
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              )}
                            </div>

                            {(ex.image_url || ex.description) && (
                              <div className="space-y-3">
                                <button 
                                  type="button" onClick={() => setExpandedDetails(v => ({ ...v, [i]: !v[i] }))}
                                  className="text-[10px] font-black uppercase tracking-widest text-black hover:text-primary transition-colors flex items-center gap-1"
                                >
                                  {isDetailed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                  Ver Técnica
                                </button>
                                {isDetailed && (
                                  <div className="space-y-3 p-3 bg-muted/30 rounded-2xl border border-border/40">
                                    {ex.image_url && <img src={ex.image_url} alt="" className="w-full h-40 object-cover rounded-xl" />}
                                    {ex.description && <p className="text-[11px] text-muted-foreground leading-relaxed italic">"{ex.description}"</p>}
                                  </div>
                                )}
                              </div>
                            )}

                            <div className="space-y-3">
                              {ex.sets_data?.map((set, sIdx) => (
                                <div key={sIdx} className="grid grid-cols-[20px_1fr_1fr_1.5fr_30px] gap-3 items-center">
                                  <span className="text-[10px] font-black text-muted-foreground/50">{sIdx + 1}</span>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Reps</label>
                                    <Input type="number" value={set.reps} onChange={e => updateExerciseSet(i, sIdx, 'reps', parseInt(e.target.value) || 0)} className="h-10 text-center bg-muted/40 font-black border-none rounded-xl" disabled={isFinalized} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Peso (kg)</label>
                                    <Input type="number" value={set.weight_kg} onChange={e => updateExerciseSet(i, sIdx, 'weight_kg', parseFloat(e.target.value) || 0)} step="0.5" className="h-10 text-center bg-muted/40 font-black border-none rounded-xl" disabled={isFinalized} />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase tracking-widest opacity-40 ml-1">Descanso (m:s)</label>
                                    <div className="flex items-center gap-1">
                                       <Input type="number" value={Math.floor(set.rest_seconds / 60)} onChange={e => updateExerciseSet(i, sIdx, 'rest_seconds', (parseInt(e.target.value) || 0) * 60 + (set.rest_seconds % 60))} className="h-10 w-full text-center bg-muted/40 font-black border-none rounded-xl text-xs" disabled={isFinalized} />
                                       <span className="font-bold opacity-30">:</span>
                                       <Input type="number" value={set.rest_seconds % 60} onChange={e => updateExerciseSet(i, sIdx, 'rest_seconds', Math.floor(set.rest_seconds / 60) * 60 + (parseInt(e.target.value) || 0))} className="h-10 w-full text-center bg-muted/40 font-black border-none rounded-xl text-xs" disabled={isFinalized} />
                                    </div>
                                  </div>
                                  {!isFinalized && (
                                    <Button variant="ghost" size="icon" onClick={() => removeSet(i, sIdx)} className="h-8 w-8 text-muted-foreground/30 mt-4" disabled={ex.sets_data.length <= 1}>
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              {!isFinalized && (
                                <Button variant="outline" size="sm" onClick={() => addSet(i)} className="w-full h-10 border-dashed rounded-xl text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100">
                                  + Añadir serie
                                </Button>
                              )}
                            </div>

                            {!isFinalized && (
                              <Button 
                                className="w-full h-12 bg-success text-white font-black italic rounded-2xl shadow-lg shadow-success/10 hover:bg-success/90"
                                onClick={() => { handleSave(); setCollapsedExercises(v => ({ ...v, [i]: true })); }}
                              >
                                <CheckCircle2 className="h-5 w-5 mr-2" /> REGISTRAR EJERCICIO
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isFinalized && exercises.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed rounded-3xl opacity-30 font-black italic uppercase tracking-widest text-xs">
                  Sin ejercicios agregados
                </div>
              )}
            </div>
          )}

        {!isFinalized && (
          <Button 
            className="w-full h-16 bg-primary text-white text-xl font-black italic tracking-tighter rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform"
            onClick={handleFinalize}
            disabled={exercises.length === 0}
          >
            <Flag className="h-6 w-6 mr-3" /> FINALIZAR ENTRENAMIENTO DEL DÍA
          </Button>
        )}

        <ExerciseSearchDialog 
          open={searchOpen} 
          onClose={() => setSearchOpen(false)} 
          onSelect={(catalogEx) => {
            const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
            setExercises(prev => {
              const newEx = [...prev];
              const existing = newEx[searchTarget] || {};
              newEx[searchTarget] = {
                ...existing,
                exercise_name: catalogEx.name,
                image_url: imageMap.get(normalize(catalogEx.name)),
                description: catalogEx.description,
                muscles: catalogEx.muscles,
                sets_data: existing.sets_data || [{ reps: 10, weight_kg: 0, rest_seconds: 60 }],
                sort_order: existing.sort_order ?? searchTarget
              } as LocalExercise;
              return newEx;
            });
          }}
        />
      </CardContent>
    </Card>
  );
}
