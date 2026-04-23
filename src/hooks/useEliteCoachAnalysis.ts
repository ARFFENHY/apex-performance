import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useEliteCoachAnalysis() {
  return useMutation({
    mutationFn: async ({ 
      exerciseName, 
      description, 
      muscles 
    }: { 
      exerciseName: string; 
      description: string; 
      muscles: string; 
    }) => {
      const { data, error } = await supabase.functions.invoke('analyze-exercise', {
        body: { exerciseName, description, muscles },
      });

      if (error) throw error;
      return data.analysis as string;
    },
    onError: (error) => {
      console.error('Error in AI analysis:', error);
      toast.error('No se pudo obtener el análisis del entrenador.');
    },
  });
}
