import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface Diet {
  id: string;
  client_id: string;
  coach_id: string | null;
  title: string;
  description: string | null;
  objective: string | null;
  calories_target: number | null;
  is_ai_generated: boolean;
  created_at: string;
  diet_meals?: DietMeal[];
}

export interface DietMeal {
  id: string;
  diet_id: string;
  meal_name: string;
  time_of_day: string;
  foods: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  notes: string;
  sort_order: number;
}

export function useDiets(clientId?: string, userId?: string) {
  return useQuery({
    queryKey: ["diets", clientId, userId],
    queryFn: async () => {
      let query = supabase
        .from("diets")
        .select("*, diet_meals(*)")
        .order("created_at", { ascending: false });

      if (clientId) {
        query = query.or(`client_id.eq.${clientId},is_template.eq.true`);
      } else if (userId) {
        query = query.or(`client_id.eq.${userId},is_template.eq.true`);
      } else {
        query = query.eq("is_template", true);
      }

      const { data, error } = await query;
      if (error) {
        console.warn("diets query:", error.message);
        return [];
      }
      return data as Diet[];
    },
  });
}

export function useCreateDietWithMeals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      diet,
      meals,
    }: {
      diet: {
        client_id: string;
        coach_id?: string | null;
        title: string;
        description?: string;
        objective?: string;
        calories_target?: number | null;
        is_ai_generated?: boolean;
      };
      meals: {
        meal_name: string;
        time_of_day: string;
        foods: string;
        calories?: number | null;
        protein_g?: number | null;
        carbs_g?: number | null;
        fat_g?: number | null;
        notes?: string;
        sort_order?: number;
      }[];
    }) => {
      const { data: d, error: de } = await supabase
        .from("diets")
        .insert(diet)
        .select()
        .single();
      if (de) throw de;

      if (meals.length > 0) {
        const rows = meals.map((m, i) => ({
          ...m,
          diet_id: d.id,
          sort_order: m.sort_order ?? i,
          notes: m.notes ?? "",
        }));
        const { error: me } = await supabase.from("diet_meals").insert(rows);
        if (me) throw me;
      }

      return d;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diets"] });
    },
  });
}

export function useDeleteDiet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (dietId: string) => {
      const { error } = await supabase.from("diets").delete().eq("id", dietId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["diets"] });
    },
  });
}
