import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Repeat, Timer } from "lucide-react";
import type { Exercise } from "@/hooks/useExercises";

interface Props {
  exercise: Exercise;
  onClose: () => void;
}

export function ExerciseAnimationModal({ exercise, onClose }: Props) {
  const url = exercise.animation_url || "";
  const isVideo = url.endsWith(".mp4") || url.endsWith(".webm");
  const isImage = url.endsWith(".gif") || url.endsWith(".png") || url.endsWith(".jpg") || url.endsWith(".webp");

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
        </DialogHeader>

        <div className="rounded-lg overflow-hidden bg-accent aspect-video flex items-center justify-center">
          {isVideo ? (
            <video src={url} autoPlay loop muted playsInline className="w-full h-full object-contain" />
          ) : isImage ? (
            <img src={url} alt={exercise.name} className="w-full h-full object-contain" />
          ) : (
            <div className="text-sm text-muted-foreground text-center p-4">
              <p>Formato de animación no soportado para preview</p>
              <p className="text-xs mt-1 break-all">{url}</p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6 justify-center py-2">
          <div className="flex items-center gap-1.5 text-sm">
            <Repeat className="h-4 w-4 text-primary" />
            <span className="font-semibold">{exercise.sets}</span>
            <span className="text-muted-foreground">series</span>
            <span className="text-muted-foreground mx-1">×</span>
            <span className="font-semibold">{exercise.reps}</span>
            <span className="text-muted-foreground">reps</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <Timer className="h-4 w-4 text-energy" />
            <span className="font-semibold">{exercise.rest_seconds}s</span>
            <span className="text-muted-foreground">descanso</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
