import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from './useProfile';

const FALLBACK_MESSAGES = [
  "Cada día que entrenas es una inversión en tu futuro. ¡Sigue adelante! 🔥",
  "No se trata de ser perfecto, se trata de ser mejor que ayer. 💪",
  "Tu único límite eres tú mismo. ¡Rómpelo! 🚀",
  "La disciplina es el puente entre tus metas y tus logros. 🌟",
  "Un paso a la vez, pero nunca dejes de avanzar. 🏆",
  "El dolor de hoy es la fuerza del mañana. ⚡",
  "Entrena porque amas tu cuerpo, no porque lo odies. ❤️",
  "Los resultados llegan a quienes no se rinden. 🎯",
];

export function useGenerateMotivationalMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile): Promise<string> => {
      // Try edge function first
      try {
        const { data, error } = await supabase.functions.invoke('motivational-message', {
          body: {
            goals: profile.goals,
            interests: profile.interests,
            display_name: profile.display_name,
          },
        });

        if (!error && data?.message) {
          return data.message;
        }
      } catch {
        // Fallback to local messages
      }

      // Fallback
      const idx = Math.floor(Math.random() * FALLBACK_MESSAGES.length);
      return FALLBACK_MESSAGES[idx];
    },
    onSuccess: async (message) => {
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('user_profiles')
        .update({ motivational_message: message, motivational_date: today })
        .eq('user_id', user!.id);

      queryClient.setQueryData(['profile', user?.id], (old: UserProfile | undefined) =>
        old ? { ...old, motivational_message: message, motivational_date: today } : old
      );
    },
  });
}
