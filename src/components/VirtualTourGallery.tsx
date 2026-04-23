import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Info, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getExerciseImage, type Gender } from "@/lib/exerciseImages";
import type { ExerciseEntry } from "@/hooks/useExerciseCatalog";

interface VirtualTourProps {
  exercises: ExerciseEntry[];
  gender: Gender;
  uploadedImageMap: Map<string, string>;
  onSelect: (exercise: ExerciseEntry) => void;
}

export function VirtualTourGallery({ exercises, gender, uploadedImageMap, onSelect }: VirtualTourProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset index if exercises change (e.g. filter changes)
  useEffect(() => {
    setActiveIndex(0);
  }, [exercises]);

  if (!exercises.length) return null;

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % exercises.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? exercises.length - 1 : prev - 1));
  };

  const currentExercise = exercises[activeIndex];

  const getImageUrl = (ex: ExerciseEntry) => {
    const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const uploaded = uploadedImageMap.get(normalize(ex.name));
    return uploaded || getExerciseImage(ex.name, ex.muscle_group, gender);
  };

  return (
    <div className="relative w-full h-[600px] sm:h-[700px] bg-black/5 rounded-3xl overflow-hidden flex flex-col items-center justify-center pt-8 pb-12">
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          key={`bg-${activeIndex}`}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 1 }}
          src={getImageUrl(currentExercise)}
          className="w-full h-full object-cover blur-3xl saturate-200"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
      </div>

      {/* 3D Carousel Gallery */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-center perspective-1000">
        <AnimatePresence initial={false} mode="popLayout">
          {exercises.map((ex, idx) => {
            const offset = (idx - activeIndex + exercises.length) % exercises.length;
            // Map offset to relative distance from center: 0 is center, 1 is right, -1 is left, etc.
            const distance = offset > exercises.length / 2 ? offset - exercises.length : offset;

            // Only render items close to the center for performance
            if (Math.abs(distance) > 2) return null;

            const isCenter = distance === 0;
            const xOffset = distance * 200; // pixels
            const zOffset = Math.abs(distance) * -150; // push back
            const rotateY = distance * -15; // angle
            const scale = 1 - Math.abs(distance) * 0.15;
            const opacity = 1 - Math.abs(distance) * 0.3;

            return (
              <motion.div
                key={ex.name}
                initial={false}
                animate={{
                  x: xOffset,
                  z: zOffset,
                  rotateY,
                  scale,
                  opacity,
                }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                className={`absolute w-[280px] sm:w-[350px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-2xl border border-white/10 ${
                  isCenter ? "z-20 ring-2 ring-primary/50" : "z-10"
                }`}
                onClick={() => {
                  if (isCenter) onSelect(ex);
                  else setActiveIndex(idx);
                }}
              >
                <img
                  src={getImageUrl(ex)}
                  alt={ex.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Gradient overlay for text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                
                {/* Information floating on the image (only visibly detailed for center) */}
                <motion.div 
                  animate={{ opacity: isCenter ? 1 : 0.4 }} 
                  className="absolute bottom-0 w-full p-6 flex flex-col gap-3"
                >
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary/80 hover:bg-primary text-primary-foreground border-0 text-[10px] tracking-wider uppercase backdrop-blur-md">
                      {ex.muscle_group}
                    </Badge>
                    {isCenter && (
                      <Badge variant="outline" className="text-white border-white/20 bg-black/40 backdrop-blur-md text-[10px] tracking-wider uppercase">
                        {ex.joint_type}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-white leading-tight">
                    {ex.name}
                  </h3>
                  
                  {isCenter && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: 0.2 }}
                      className="space-y-2 mt-2"
                    >
                      <div className="flex flex-col gap-1 mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Músculos</span>
                        <p className="text-xs text-zinc-300 font-medium">
                          {ex.muscles}
                        </p>
                      </div>
                      <div className="text-xs text-white/50 flex items-center gap-1.5 mt-2 transition-colors group">
                        <Info className="h-3 w-3" /> Click para ver análisis médico completo
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="relative z-20 flex items-center gap-6 mt-8">
        <button
          onClick={prevSlide}
          className="h-14 w-14 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-lg"
        >
          <ChevronLeft className="h-6 w-6 ml-[-2px]" />
        </button>
        
        <div className="text-sm font-bold tracking-widest text-muted-foreground uppercase w-32 text-center">
          {activeIndex + 1} / {exercises.length}
        </div>

        <button
          onClick={nextSlide}
          className="h-14 w-14 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-lg"
        >
          <ChevronRight className="h-6 w-6 mr-[-2px]" />
        </button>
      </div>
    </div>
  );
}
