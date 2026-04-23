import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useMemo } from 'react';

export interface RecipeImage {
  id: string;
  recipe_name: string;
  image_url: string;
  uploaded_by: string | null;
  created_at: string;
}

export function useRecipeImages() {
  return useQuery({
    queryKey: ['recipe_images'],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipe_images')
        .select('*')
        .order('recipe_name');
      if (error) {
        console.warn('recipe_images query failed:', error.message);
        return [] as RecipeImage[];
      }
      return (data || []) as RecipeImage[];
    },
  });
}

/** Returns a Map<normalizedName, imageUrl> for fast lookup */
export function useRecipeImageMap() {
  const { data } = useRecipeImages();
  
  return useMemo(() => {
    const map = new Map<string, string>();
    if (data) {
      for (const item of data) {
        const key = item.recipe_name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        map.set(key, item.image_url);
      }
    }
    return map;
  }, [data]);
}

export function useUploadRecipeImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipeName,
      file,
    }: {
      recipeName: string;
      file: File;
    }) => {
      const ext = file.name.split('.').pop() || 'png';
      const safeName = recipeName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const path = `recipes/${safeName}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(path);
      const imageUrl = urlData.publicUrl;

      const { data: { user } } = await supabase.auth.getUser();

      // Check if record exists
      const { data: existing } = await supabase
        .from('recipe_images')
        .select('id')
        .eq('recipe_name', recipeName)
        .maybeSingle();

      if (existing) {
        const { error: dbError } = await supabase
          .from('recipe_images')
          .update({ image_url: imageUrl, uploaded_by: user?.id })
          .eq('id', existing.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('recipe_images')
          .insert({
            recipe_name: recipeName,
            image_url: imageUrl,
            uploaded_by: user?.id,
          });
        if (dbError) throw dbError;
      }

      return imageUrl;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe_images'] });
      toast.success('Imagen de receta actualizada');
    },
    onError: (err: any) => {
      toast.error('Error al subir imagen: ' + (err.message || 'Error desconocido'));
    },
  });
}

export function useGenerateRecipeImage() {
  const qc = useQueryClient();
  const uploadMutation = useUploadRecipeImage();

  return useMutation({
    mutationFn: async ({
      recipeName,
      force = true,
    }: {
      recipeName: string;
      force?: boolean;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-recipe-image', {
        body: { recipe_name: recipeName, force },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data.image_url;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['recipe_images'] });
      toast.success(`Receta actualizada: ${variables.recipeName}`);
    },
    onError: (err: any) => {
      console.error(`[GENERATION_FAIL]:`, err);
      toast.error(`Error de IA: ${err.message || 'Intente nuevamente'}`);
    },
  });
}

export function useDeleteRecipeImage() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (recipeName: string) => {
      const { error } = await supabase
        .from('recipe_images')
        .delete()
        .eq('recipe_name', recipeName);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe_images'] });
      toast.success('Imagen de receta eliminada');
    },
    onError: () => toast.error('Error al eliminar imagen'),
  });
}
