import { useState, useMemo, useRef } from "react";
import { Search, Upload, Trash2, ImageIcon, Check, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EXERCISE_CATALOG, MUSCLE_GROUPS, type ExerciseEntry } from "@/hooks/useExerciseCatalog";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useExerciseImages, useUploadExerciseImage, useDeleteExerciseImage, useGenerateExerciseImage } from "@/hooks/useExerciseImages";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Play } from "lucide-react";
import { MassGenerationManager } from "@/components/MassGenerationManager";

function SingleImageSlot({
  exercise,
  imageUrl,
  onUpload,
  onDelete,
  isUploading,
  onPreview,
  position = 'start',
  gender = 'male',
}: {
  exercise: ExerciseEntry;
  imageUrl: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  isUploading: boolean;
  onPreview: (url: string) => void;
  position?: 'start' | 'end';
  gender?: 'male' | 'female';
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const generateMutation = useGenerateExerciseImage();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Solo imágenes"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Máximo 10MB"); return; }
    onUpload(file);
    e.target.value = "";
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await generateMutation.mutateAsync({
        exerciseName: exercise.name,
        description: exercise.description,
        muscles: exercise.muscles,
        position,
        gender,
        force: true
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden flex flex-col md:flex-row gap-4 p-4">
      <div
        className="relative w-full md:w-48 h-48 bg-muted/30 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border border-dashed border-border/50 hover:border-primary/50 transition-colors"
        onClick={() => imageUrl && onPreview(imageUrl)}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={exercise.name} className="w-full h-full object-contain bg-black/5" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground/30">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">Sin imagen</span>
          </div>
        )}
        {imageUrl && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-emerald-500 text-white border-0 text-[10px] px-2 py-0.5 uppercase">
              <Check className="h-3 w-3 mr-1" />LISTO
            </Badge>
          </div>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-center space-y-3">
        <div>
          <h4 className="font-bold text-sm mb-1 uppercase tracking-wider text-muted-foreground">Demostración {gender === 'male' ? 'Masculina' : 'Femenina'}</h4>
          <p className="text-xs text-muted-foreground line-clamp-2">{exercise.description}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button
            size="sm"
            variant="outline"
            className="px-4 h-9"
            onClick={() => fileRef.current?.click()}
            disabled={isUploading || isGenerating}
          >
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Subiendo..." : "Subir Manual"}
          </Button>

          <Button
            size="sm"
            className="px-4 h-9 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
            variant="outline"
            onClick={handleGenerate}
            disabled={isUploading || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {imageUrl ? "Regenerar IA" : "Generar con IA"}
          </Button>
          
          {imageUrl && (
            <Button
              size="sm"
              variant="ghost"
              className="px-3 h-9 text-destructive hover:bg-destructive/10"
              onClick={onDelete}
              disabled={isUploading || isGenerating}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ExerciseAdminCard({
  exercise,
  images,
  onUpload,
  onDelete,
  isUploading,
  onPreview,
}: {
  exercise: ExerciseEntry;
  images: any[];
  onUpload: (name: string, file: File) => void;
  onDelete: (name: string) => void;
  isUploading: boolean;
  onPreview: (url: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const maleImg = images.find(img => img.exercise_name === exercise.name && img.gender === 'male')?.image_url;
  const femaleImg = images.find(img => img.exercise_name === exercise.name && img.gender === 'female')?.image_url;

  const count = (maleImg ? 1 : 0) + (femaleImg ? 1 : 0);

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-md">
      <button
        className={`w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors text-left ${count === 2 ? 'border-l-4 border-l-emerald-500' : count === 1 ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-muted'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex-shrink-0">
            {count === 2 ? (
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-emerald-500" />
              </div>
            ) : count === 1 ? (
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-amber-500" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground/30">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base leading-tight truncate">{exercise.name}</h3>
            <div className="flex gap-1.5 mt-1">
              <Badge variant="outline" className="text-[10px] bg-muted/50 uppercase tracking-tighter">{exercise.muscle_group}</Badge>
              <Badge variant="outline" className="text-[10px] bg-muted/50 uppercase tracking-tighter">{count}/2 IMÁGENES</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {expanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/30 pt-4 bg-muted/5">
          <SingleImageSlot
            exercise={exercise}
            imageUrl={maleImg || null}
            onUpload={(file) => onUpload(exercise.name, file)}
            onDelete={() => onDelete(exercise.name)}
            isUploading={isUploading}
            onPreview={onPreview}
            gender="male"
          />
          <SingleImageSlot
            exercise={exercise}
            imageUrl={femaleImg || null}
            onUpload={(file) => onUpload(exercise.name, file)}
            onDelete={() => onDelete(exercise.name)}
            isUploading={isUploading}
            onPreview={onPreview}
            gender="female"
          />
        </div>
      )}
    </div>
  );
}

export default function ExerciseImageAdminPage() {
  const [search, setSearch] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { data: images = [] } = useExerciseImages();
  const uploadMutation = useUploadExerciseImage();
  const deleteMutation = useDeleteExerciseImage();
  const generateMutation = useGenerateExerciseImage();
  
  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);

  // Group images by exercise name for the card
  const groupedImages = useMemo(() => {
    const m = new Map<string, any[]>();
    for (const img of images) {
      if (!m.has(img.exercise_name)) m.set(img.exercise_name, []);
      m.get(img.exercise_name)!.push(img);
    }
    return m;
  }, [images]);

  const filtered = useMemo(() => {
    return EXERCISE_CATALOG.filter((ex) => {
      const matchSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase()) || ex.muscles.toLowerCase().includes(search.toLowerCase());
      const matchMuscle = muscleFilter === "all" || ex.muscle_group === muscleFilter;
      const exImages = groupedImages.get(ex.name) || [];
      const hasBoth = exImages.some(i => i.gender === 'male') && exImages.some(i => i.gender === 'female');
      const matchStatus = statusFilter === "all" ||
        (statusFilter === "complete" && hasBoth) ||
        (statusFilter === "partial" && exImages.length > 0 && !hasBoth) ||
        (statusFilter === "empty" && exImages.length === 0);
      return matchSearch && matchMuscle && matchStatus;
    });
  }, [search, muscleFilter, statusFilter, groupedImages]);

  const totalPossible = EXERCISE_CATALOG.length * 2; // male + female
  const currentCount = images.length;

  const handleUpload = async (name: string, file: File) => {
    setUploadingName(name);
    try {
      await uploadMutation.mutateAsync({ exerciseName: name, file });
    } finally {
      setUploadingName(null);
    }
  };

  const handleDelete = (name: string) => {
    if (window.confirm("¿Seguro que quieres borrar la imagen de este ejercicio?")) {
      deleteMutation.mutate({ exerciseName: name });
    }
  };

  const handleBulkGenerate = async () => {
    const missing = [];
    for (const ex of EXERCISE_CATALOG) {
      const exImages = groupedImages.get(ex.name) || [];
      if (!exImages.some(i => i.gender === 'male')) missing.push({ ex, gender: 'male' });
      if (!exImages.some(i => i.gender === 'female')) missing.push({ ex, gender: 'female' });
    }

    if (missing.length === 0) { toast.info("Todas las imágenes están completas"); return; }
    if (!window.confirm(`Se generarán ${missing.length} imágenes faltantes con IA. ¿Continuar?`)) return;

    setIsBulkGenerating(true);
    let success = 0;
    try {
      for (const item of missing) {
        try {
          await generateMutation.mutateAsync({
            exerciseName: item.ex.name,
            description: item.ex.description,
            muscles: item.ex.muscles,
            position: 'start',
            gender: item.gender as 'male' | 'female',
            force: false
          });
          success++;
          toast.info(`Generadas: ${success}/${missing.length}`);
        } catch (e) {
          console.error(`Error generando ${item.ex.name}:`, e);
        }
      }
      toast.success("Generación masiva completada");
    } finally {
      setIsBulkGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Generador Masivo (Bypass de facturación API) */}
        <MassGenerationManager />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">Gestión de Catálogo</h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Control total sobre las demostraciones visuales. Usa la <span className="text-primary font-bold">IA</span> para rellenar huecos automáticamente.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button 
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 h-12 shadow-xl shadow-primary/5 rounded-2xl hover:scale-105 transition-all"
              onClick={handleBulkGenerate}
              disabled={isBulkGenerating}
            >
              {isBulkGenerating ? (
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5 mr-3" />
              )}
              {isBulkGenerating ? "Procesando..." : "Generar Masivamente"}
            </Button>

            <div className="bg-card border p-4 rounded-2xl flex items-center gap-6 min-w-[300px]">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Activos Visuales</span>
                <div className="text-2xl font-black leading-none">{currentCount} / {totalPossible}</div>
              </div>
              <div className="flex-1">
                <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentCount / totalPossible) * 100}%` }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
              <div className="text-sm font-black text-primary">
                {Math.round((currentCount / totalPossible) * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-wrap gap-4 items-center bg-card p-4 rounded-2xl border border-border/50">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Escribe el nombre del ejercicio para buscar..." 
              className="pl-10 h-11 bg-muted/30 border-none rounded-xl"
            />
          </div>
          <div className="flex gap-2 min-w-full md:min-w-0">
            <Select value={muscleFilter} onValueChange={setMuscleFilter}>
              <SelectTrigger className="w-[180px] h-11 rounded-xl bg-muted/30 border-none">
                <Dumbbell className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Músculo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los músculos</SelectItem>
                {MUSCLE_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-11 rounded-xl bg-muted/30 border-none">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ver todos</SelectItem>
                <SelectItem value="complete">Con imagen</SelectItem>
                <SelectItem value="empty">Sin imagen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Exercise List */}
        <div className="grid gap-3">
          {filtered.map((ex) => (
            <ExerciseAdminCard
              key={ex.name}
              exercise={ex}
              images={groupedImages.get(ex.name) || []}
              onUpload={handleUpload}
              onDelete={handleDelete}
              isUploading={uploadingName === ex.name}
              onPreview={setPreviewUrl}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border/50">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground">No encontramos nada</h3>
            <p className="text-sm text-muted-foreground/60">Prueba con otros filtros o términos de búsqueda</p>
          </div>
        )}
      </div>

      {/* Modern Preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black border-none">
          <div className="relative aspect-square md:aspect-video flex items-center justify-center bg-zinc-900 group">
            {previewUrl && (
              <img 
                src={previewUrl} 
                alt="Vista Previa" 
                className="max-w-full max-h-full object-contain"
              />
            )}
            <div className="absolute top-4 left-4">
              <Badge className="bg-black/60 backdrop-blur-md text-white border-white/20">Modo Vista Previa</Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setPreviewUrl(null)}
            >
              <span className="sr-only">Cerrar</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
