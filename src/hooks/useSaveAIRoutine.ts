import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { GeneratedRoutine } from './useRoutineGenerator';

export function useSaveAIRoutine() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ routine, programName }: { routine: GeneratedRoutine; programName: string }) => {
      if (!user) throw new Error('No autenticado');

      // 1. Create program
      const { data: program, error: progError } = await supabase
        .from('programs')
        .insert({
          coach_id: user.id,
          name: programName,
          description: `Generado por IA — ${routine.objetivo} / ${routine.nivel} / ${routine.dias_semana} días`,
        })
        .select('id')
        .single();

      if (progError) throw progError;

      // 2. Create workouts for each day
      for (let dayIdx = 0; dayIdx < routine.rutina.length; dayIdx++) {
        const day = routine.rutina[dayIdx];

        const { data: workout, error: wError } = await supabase
          .from('workouts')
          .insert({
            program_id: program.id,
            name: `${day.dia} — ${day.nombre}`,
            day_order: dayIdx + 1,
          })
          .select('id')
          .single();

        if (wError) throw wError;

        // 3. Create exercises for each block
        let orderIndex = 0;
        const exercises = day.bloques.flatMap((block) =>
          block.ejercicios.map((ex) => ({
            workout_id: workout.id,
            name: ex.nombre,
            sets: ex.series,
            reps: typeof ex.reps === 'string' ? parseInt(ex.reps) || 12 : ex.reps,
            rest_seconds: ex.descanso_seg,
            order_index: orderIndex++,
            animation_url: ex.animacion || null,
            ai_generated: true,
          }))
        );

        if (exercises.length > 0) {
          const { error: exError } = await supabase.from('exercises').insert(exercises);
          if (exError) throw exError;
        }
      }

      return program.id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['programs'] });
      qc.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Rutina IA guardada como programa');
    },
    onError: (err: Error) => {
      console.error('Save AI routine error:', err);
      toast.error('Error al guardar la rutina');
    },
  });
}
