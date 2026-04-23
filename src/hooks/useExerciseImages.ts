import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useMemo } from 'react';

export interface ExerciseImage {
  id: string;
  exercise_name: string;
  image_url: string;
  position: 'start' | 'end';
  gender: 'male' | 'female';
  media_type?: string;
  source?: string;
  uploaded_by: string | null;
  created_at: string;
}

export function useExerciseImages() {
  return useQuery({
    queryKey: ['exercise_images'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_images')
        .select('*')
        .order('exercise_name');
      if (error) {
        console.warn('exercise_images query failed:', error.message);
        return [] as ExerciseImage[];
      }
      return (data || []) as ExerciseImage[];
    },
  });
}

/** Returns a Map<normalizedName, imageUrl> for fast lookup, now gender-aware */
export function useExerciseImageMap(gender?: 'male' | 'female') {
  const { data } = useExerciseImages();
  
  return useMemo(() => {
    const map = new Map<string, string>();
    if (data) {
      // Sort so major images (start position) for the correct gender are prioritized
      const sorted = [...data].sort((a, b) => {
        if (a.gender === gender && b.gender !== gender) return -1;
        if (a.gender !== gender && b.gender === gender) return 1;
        if (a.position === 'start' && b.position !== 'start') return -1;
        return 0;
      });

      for (const item of sorted) {
        const key = item.exercise_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (!map.has(key)) {
          map.set(key, item.image_url);
        }
      }
    }
    return map;
  }, [data, gender]);
}

/** Returns a single image for a specific exercise (simplified mode) */
export function useSingleExerciseImage(exerciseName: string) {
  const { data } = useExerciseImages();
  if (!data) return null;
  
  // Buscamos la imagen marcada como principal (start/male)
  const main = data.find(i => i.exercise_name === exerciseName && i.position === 'start' && i.gender === 'male');
  if (main) return main.image_url;
  
  // Si no hay principal, devolvemos la primera que encontremos para ese ejercicio
  const any = data.find(i => i.exercise_name === exerciseName);
  return any?.image_url || null;
}

export function useUploadExerciseImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      exerciseName,
      file,
    }: {
      exerciseName: string;
      file: File;
    }) => {
      const ext = file.name.split('.').pop() || 'jpg';
      const safeName = exerciseName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Forzamos un nombre de archivo único por ejercicio
      const path = `exercises/${safeName}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(path);
      const imageUrl = urlData.publicUrl;

      const { data: { user } } = await supabase.auth.getUser();

      // En el modelo simplificado, todas las imágenes son 'start' y 'male' internamente
      const { data: existing } = await supabase
        .from('exercise_images')
        .select('id')
        .eq('exercise_name', exerciseName)
        .eq('position', 'start')
        .eq('gender', 'male')
        .maybeSingle();

      if (existing) {
        const { error: dbError } = await supabase
          .from('exercise_images')
          .update({ image_url: imageUrl, source: 'manual', uploaded_by: user?.id })
          .eq('id', existing.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('exercise_images')
          .insert({
            exercise_name: exerciseName,
            image_url: imageUrl,
            position: 'start',
            gender: 'male',
            media_type: 'image',
            source: 'manual',
            uploaded_by: user?.id,
          });
        if (dbError) throw dbError;
      }

      return imageUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exercise_images'] });
      toast.success('Imagen actualizada');
    },
    onError: (err: any) => {
      toast.error('Error al subir imagen: ' + (err.message || 'Error desconocido'));
    },
  });
}

export function useExerciseImageSet(exerciseName: string) {
  const { data: images = [] } = useExerciseImages();
  
  const getUrl = (position: 'start' | 'end', gender: 'male' | 'female') => {
    const normalize = (v: string) => v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const target = normalize(exerciseName);
    return images.find(img => 
      normalize(img.exercise_name) === target && 
      img.position === position && 
      img.gender === gender
    )?.image_url || null;
  };

  return {
    start_male: getUrl('start', 'male'),
    start_female: getUrl('start', 'female'),
    end_male: getUrl('end', 'male'),
    end_female: getUrl('end', 'female'),
  };
}

export function useGenerateExerciseImage() {
  const qc = useQueryClient();
  const uploadMutation = useUploadExerciseImage();

  return useMutation({
    mutationFn: async ({
      exerciseName,
      gender = 'male',
      position = 'start',
    }: {
      exerciseName: string;
      description?: string;
      muscles?: string;
      gender?: 'male' | 'female';
      position?: 'start' | 'end';
    }) => {
      console.log(`[FRONTEND] Generating exercise via browser: ${exerciseName}`);

      const prompt = `Professional fitness photography of a muscular person performing the exercise ${exerciseName}. Focus on muscles. Gym environment, high-end resolution, cinematic lighting.`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true&model=turbo&seed=${Math.floor(Math.random()*999999)}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Pollinations API congestion. Intente nuevamente en breves.");
      
      const blob = await res.blob();
      const file = new File([blob], `${exerciseName}_${gender}_${position}.png`, { type: "image/png" });

      const imageUrl = await uploadMutation.mutateAsync({
        exerciseName,
        gender,
        position,
        file
      });
      return imageUrl;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['exercise_images'] });
      toast.success(`Variante generada: ${variables.exerciseName}`);
    },
    onError: (err: any) => {
      console.error(`[MUTATION_FAIL]:`, err);
      toast.error(`Aviso: ${err.message || 'Error de IA'}`);
    },
  });
}

export function useDeleteExerciseImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ exerciseName }: { exerciseName: string }) => {
      const { error } = await supabase
        .from('exercise_images')
        .delete()
        .eq('exercise_name', exerciseName);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exercise_images'] });
      toast.success('Imagen eliminada');
    },
    onError: () => toast.error('Error al eliminar imagen'),
  });
}
