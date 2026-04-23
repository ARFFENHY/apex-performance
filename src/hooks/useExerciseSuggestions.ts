import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export interface SuggestedExercise {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  notes?: string;
  youtube_search?: string;
}

export function useExerciseSuggestions() {
  const [suggestions, setSuggestions] = useState<SuggestedExercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSuggestions = async (muscleGroup: string, _category?: string) => {
    if (!muscleGroup) return;
    setIsLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke("suggest-exercises", {
        body: { muscle: muscleGroup, count: 5 },
      });

      if (error) throw error;

      // The function returns an array directly or an error object
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      // Handle both array response and {exercises: []} shape
      const exercises = Array.isArray(data) ? data : data?.exercises || [];
      setSuggestions(exercises);
    } catch (err: any) {
      console.error("Exercise suggestions error:", err);
      toast.error("Error al obtener sugerencias");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => setSuggestions([]);

  return { suggestions, isLoading, fetchSuggestions, clearSuggestions };
}
