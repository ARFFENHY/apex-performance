import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface GeneratedExercise {
  nombre: string;
  series: number;
  reps: string;
  peso_sugerido: string;
  descanso_seg: number;
  animacion: string;
}

export interface MuscleBlock {
  musculo: string;
  ejercicios: GeneratedExercise[];
}

export interface GeneratedDay {
  dia: string;
  nombre: string;
  bloques: MuscleBlock[];
}

export interface GeneratedRoutine {
  objetivo: string;
  nivel: string;
  dias_semana: number;
  rutina: GeneratedDay[];
}

export type Objetivo = "fuerza" | "hipertrofia" | "resistencia";
export type Nivel = "principiante" | "intermedio" | "avanzado";

export function useRoutineGenerator() {
  const [routine, setRoutine] = useState<GeneratedRoutine | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async (objetivo: Objetivo, nivel: Nivel, diasSemana: number) => {
    setIsLoading(true);
    setRoutine(null);

    try {
      const { data, error } = await supabase.functions.invoke("suggest-exercises", {
        body: { objetivo, nivel, dias_semana: diasSemana },
      });

      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setRoutine(data as GeneratedRoutine);
    } catch (err: any) {
      console.error("Routine generation error:", err);
      toast.error("Error al generar la rutina");
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => setRoutine(null);

  return { routine, isLoading, generate, clear };
}
