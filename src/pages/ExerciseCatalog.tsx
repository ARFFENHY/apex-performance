import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, Dumbbell, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXERCISE_CATALOG, MUSCLE_GROUPS, EXERCISE_CATEGORIES, type ExerciseEntry } from "@/hooks/useExerciseCatalog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getExerciseImage, type Gender } from "@/lib/exerciseImages";
import { useProfile } from "@/hooks/useProfile";
import { useExerciseImageMap } from "@/hooks/useExerciseImages";
import { ExerciseDetailDialog } from "@/components/ExerciseDetailDialog";
import { VirtualTourGallery } from "@/components/VirtualTourGallery";
import { Layers } from "lucide-react";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.03 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const CATEGORY_LABELS: Record<string, string> = {
  compound: "Compuesto",
  isolation: "Aislamiento",
  calisthenics: "Calistenia",
  crossfit: "CrossFit",
  mobility: "Movilidad",
  stretching: "Estiramiento",
};

function ExerciseCard({
  exercise,
  gender,
  uploadedImageMap,
  onClick,
}: {
  exercise: ExerciseEntry;
  gender: Gender;
  uploadedImageMap: Map<string, string>;
  onClick: () => void;
}) {
  const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const uploaded = uploadedImageMap.get(normalize(exercise.name));
  const imageUrl = uploaded || getExerciseImage(exercise.name, exercise.muscle_group, gender);

  return (
    <motion.div
      variants={item}
      className="group relative flex flex-col h-full rounded-2xl border bg-card/60 backdrop-blur-sm overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl cursor-pointer"
      onClick={onClick}
    >
      {/* Image Header */}
      <div className="relative aspect-video overflow-hidden bg-muted/20">
        <img
          src={imageUrl}
          alt={exercise.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60" />
        
        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge className="bg-black/40 backdrop-blur-md text-white border-0 text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold">
            {exercise.muscle_group}
          </Badge>
          <Badge className="bg-black/40 backdrop-blur-md text-white border-0 text-[10px] px-2 py-0.5 uppercase tracking-wider font-semibold">
            {CATEGORY_LABELS[exercise.category] || exercise.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
            {exercise.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-8">
            {exercise.description}
          </p>
        </div>

        <div className="space-y-4 flex-1">
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">
                Músculos Trabajados
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {exercise.muscles.split(",").map((m) => (
                <span key={m} className="text-[11px] font-medium text-foreground py-0.5 px-1.5 bg-secondary/30 rounded-md">
                  {m.trim()}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-foreground bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {exercise.joint_type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ExerciseCatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseEntry | null>(null);
  const { data: profile } = useProfile();
  
  // Start with profile gender, but allow manual toggle
  const [viewGender, setViewGender] = useState<"male" | "female">((profile?.gender as any) || "male");
  const [viewMode, setViewMode] = useState<"grid" | "tour">("tour");
  
  const uploadedImageMap = useExerciseImageMap(viewGender);

  const toggleMuscle = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) 
        ? prev.filter(m => m !== muscle)
        : [...prev, muscle]
    );
  };

  const filtered = useMemo(() => {
    return EXERCISE_CATALOG.filter((ex) => {
      const matchSearch = !search || 
        ex.name.toLowerCase().includes(search.toLowerCase()) || 
        ex.muscles.toLowerCase().includes(search.toLowerCase());
      
      const matchMuscle = selectedMuscles.length === 0 || selectedMuscles.includes(ex.muscle_group);
      const matchCategory = categoryFilter === "all" || ex.category === categoryFilter;
      
      return matchSearch && matchMuscle && matchCategory;
    });
  }, [search, selectedMuscles, categoryFilter]);

  const groupedByMuscle = useMemo(() => {
    const groups: Record<string, ExerciseEntry[]> = {};
    filtered.forEach((ex) => {
      if (!groups[ex.muscle_group]) groups[ex.muscle_group] = [];
      groups[ex.muscle_group].push(ex);
    });
    return groups;
  }, [filtered]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-black italic tracking-tighter uppercase leading-none">Catálogo</h1>
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1.5">{filtered.length} ejercicios encontrados</p>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setViewMode("tour")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === "tour" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Layers className="h-3.5 w-3.5" /> RECORRIDO VIRTUAL
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${viewMode === "grid" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Dumbbell className="h-3.5 w-3.5" /> GRID
              </button>
            </div>

            {/* Gender Toggle */}
            <div className="flex items-center bg-muted/30 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setViewGender("male")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewGender === "male" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                HOMBRE
              </button>
              <button
                onClick={() => setViewGender("female")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewGender === "female" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`}
              >
                MUJER
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar ejercicio o músculo..." className="pl-9 h-11" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] h-11">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {EXERCISE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedMuscles.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedMuscles([])}
                className="h-11 px-4 text-xs font-bold uppercase tracking-widest text-energy hover:text-energy hover:bg-energy/10"
              >
                Limpiar filtros
              </Button>
            )}
          </div>

          {/* Muscle Chips - Horizontal Scroll */}
          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              <button
                onClick={() => setSelectedMuscles([])}
                className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                  selectedMuscles.length === 0 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-background text-muted-foreground border-border hover:border-primary/30"
                }`}
              >
                Todo el Cuerpo
              </button>
              {MUSCLE_GROUPS.map((muscle) => (
                <button
                  key={muscle}
                  onClick={() => toggleMuscle(muscle)}
                  className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-2 ${
                    selectedMuscles.includes(muscle)
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-card text-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 opacity-30">
            <p className="text-sm font-bold uppercase tracking-widest">No se encontraron ejercicios</p>
          </div>
        ) : viewMode === "tour" ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <VirtualTourGallery 
              exercises={filtered} 
              gender={viewGender} 
              uploadedImageMap={uploadedImageMap}
              onSelect={setSelectedExercise}
            />
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByMuscle).map(([group, exercises]) => (
              <div key={group}>
                <h2 className="text-lg font-display font-bold mb-3 flex items-center gap-2 border-l-4 border-primary pl-3">
                  {group}
                  <Badge variant="secondary" className="text-[10px] font-black h-5">{exercises.length}</Badge>
                </h2>
                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  {exercises.map((ex) => (
                    <ExerciseCard
                      key={ex.name}
                      exercise={ex}
                      gender={viewGender}
                      uploadedImageMap={uploadedImageMap}
                      onClick={() => setSelectedExercise(ex)}
                    />
                  ))}
                </motion.div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ExerciseDetailDialog
        key={selectedExercise?.name}
        exercise={selectedExercise}
        open={!!selectedExercise}
        onOpenChange={(open) => !open && setSelectedExercise(null)}
        initialGender={viewGender}
      />
    </DashboardLayout>
  );
}
