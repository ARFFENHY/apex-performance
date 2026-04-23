import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { type ExerciseEntry } from "@/hooks/useExerciseCatalog";
import { useExerciseImageSet, useGenerateExerciseImage } from "@/hooks/useExerciseImages";
import { getExerciseImage } from "@/lib/exerciseImages";
import { ImageIcon, ArrowRight, Sparkles, Loader2, BrainCircuit } from "lucide-react";
import { useEliteCoachAnalysis } from "@/hooks/useEliteCoachAnalysis";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, string> = {
  compound: "Compuesto",
  isolation: "Aislamiento",
  calisthenics: "Calistenia",
  crossfit: "CrossFit",
  mobility: "Movilidad",
  stretching: "Estiramiento",
};

function ImageWithFallback({
  src,
  fallbackSrc,
  alt,
  className,
  onGenerate,
  isGenerating,
}: {
  src: string | null;
  fallbackSrc: string;
  alt: string;
  className?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
}) {
  const finalSrc = src || fallbackSrc;
  return (
    <div className={`relative bg-muted/20 rounded-xl overflow-hidden ${className}`}>
      <img
        src={finalSrc}
        alt={alt}
        className="w-full h-full object-contain"
        loading="lazy"
      />
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
        {!src && (
          <Badge variant="outline" className="text-[9px] bg-background/80 backdrop-blur-sm">
            Genérica
          </Badge>
        )}
        {src && <div />}
        {onGenerate && (
          <Button
            size="sm"
            variant="secondary"
            className="h-7 text-[10px] px-2 bg-background/80 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            onClick={onGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                {src ? "Regenerar IA" : "Generar IA"}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export function ExerciseDetailDialog({
  exercise,
  open,
  onOpenChange,
  initialGender = "male",
}: {
  exercise: ExerciseEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialGender?: "male" | "female";
}) {
  const [gender, setGender] = useState<"male" | "female">(initialGender);
  const [generatingSlot, setGeneratingSlot] = useState<string | null>(null);
  const images = useExerciseImageSet(exercise?.name || "");
  const generateMutation = useGenerateExerciseImage();
  const eliteAnalysis = useEliteCoachAnalysis();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const fallbackImg = exercise
    ? getExerciseImage(exercise.name, exercise.muscle_group, "neutral")
    : "";

  if (!exercise) return null;

  const startImg = gender === "male" ? images.start_male : images.start_female;
  const endImg = gender === "male" ? images.end_male : images.end_female;

  const handleGenerate = async (position: "start" | "end") => {
    const slotKey = `${position}-${gender}`;
    setGeneratingSlot(slotKey);
    try {
      await generateMutation.mutateAsync({
        exerciseName: exercise.name,
        description: exercise.description,
        muscles: exercise.muscles,
        position,
        gender,
        force: true,
      });
    } catch (err) {
      // Error already handled by mutation's onError
    } finally {
      setGeneratingSlot(null);
    }
  };

  const handleEliteAnalysis = async () => {
    try {
      const result = await eliteAnalysis.mutateAsync({
        exerciseName: exercise.name,
        description: exercise.description,
        muscles: exercise.muscles
      });
      setAnalysis(result);
      toast.success("Análisis de élite completado");
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{exercise.name}</DialogTitle>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="default">{exercise.muscle_group}</Badge>
            <Badge variant="outline">{CATEGORY_LABELS[exercise.category] || exercise.category}</Badge>
            <Badge variant="outline">{exercise.joint_type}</Badge>
          </div>
        </DialogHeader>

        {/* Gender toggle */}
        <div className="flex justify-center mt-2">
          <Tabs value={gender} onValueChange={(v) => setGender(v as "male" | "female")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[300px] mx-auto">
              <TabsTrigger value="male">Masculino</TabsTrigger>
              <TabsTrigger value="female">Femenino</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Focused Start image */}
        <div className="flex flex-col items-center mt-6">
          <div className="w-full max-w-md space-y-3">
            <h3 className="text-sm font-bold text-center uppercase tracking-widest text-primary">
              Demostración del Ejercicio
            </h3>
            <ImageWithFallback
              src={startImg}
              fallbackSrc={fallbackImg}
              alt={exercise.name}
              className="aspect-square shadow-2xl shadow-primary/10 border-2 border-primary/5"
              onGenerate={() => handleGenerate("start")}
              isGenerating={generatingSlot === `start-${gender}`}
            />
          </div>
        </div>

        {/* Exercise instructions */}
        <div className="space-y-4 mt-4">
          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-sm">📋 Cómo realizar el ejercicio</h3>
            <p className="text-sm text-muted-foreground">{exercise.description}</p>
          </div>

          <div className="bg-muted/30 rounded-xl p-4 space-y-3">
            <h3 className="font-bold text-sm">💪 Músculos trabajados</h3>
            <div className="flex flex-wrap gap-1.5">
              {exercise.muscles.split(",").map((m) => (
                <Badge key={m.trim()} variant="secondary" className="text-xs">
                  {m.trim()}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-bold text-sm mb-1">🔗 Tipo de articulación</h3>
              <p className="text-sm text-muted-foreground">{exercise.joint_type}</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-4">
              <h3 className="font-bold text-sm mb-1">📂 Categoría</h3>
              <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[exercise.category] || exercise.category}</p>
            </div>
          </div>

          {/* Elite Coach Analysis Section */}
          <div className="mt-8 border-t border-primary/20 pt-6">
            {!analysis ? (
              <div className="text-center p-8 bg-primary/5 rounded-2xl border border-primary/10 border-dashed">
                <BrainCircuit className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                <h3 className="text-base font-bold mb-2">Análisis Técnico de Élite</h3>
                <p className="text-xs text-muted-foreground mb-6 max-w-xs mx-auto">
                  Recibe instrucciones master por parte de nuestra IA entrenadora para una ejecución perfecta.
                </p>
                <Button 
                  onClick={handleEliteAnalysis} 
                  disabled={eliteAnalysis.isPending}
                  variant="premium"
                  className="gap-2"
                >
                  {eliteAnalysis.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {eliteAnalysis.isPending ? "Analizando técnica..." : "Generar Análisis de Élite"}
                </Button>
              </div>
            ) : (
              <div className="bg-card border-2 border-primary/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="gradient-primary px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-black/20 flex items-center justify-center backdrop-blur-md">
                      <Sparkles className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-black italic uppercase tracking-tighter text-primary-foreground">
                      Elite Coach Masterclass
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-white/40 text-white font-black bg-white/10 px-3">
                    ANÁLISIS IA
                  </Badge>
                </div>
                <div className="p-8">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-medium">
                      {analysis}
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black italic text-primary uppercase tracking-widest text-center sm:text-left">
                      "La técnica es el puente entre el esfuerzo y el resultado."
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setAnalysis(null)}
                      className="text-[10px] uppercase font-black tracking-widest border-primary/20 hover:bg-primary/10 h-10 px-6 rounded-full"
                    >
                      Nuevo Análisis
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
