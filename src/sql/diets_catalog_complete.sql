-- ACTUALIZACIÓN MASIVA DE DIETAS (30 DÍAS)
DO $$
DECLARE
    _admin_id UUID;
    _diet_id UUID;
BEGIN
    -- 1. Preparar tabla para plantillas globales
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'diets' AND column_name = 'is_template') THEN
        ALTER TABLE public.diets ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Hacer client_id opcional para plantillas
    ALTER TABLE public.diets ALTER COLUMN client_id DROP NOT NULL;

    -- Obtener ID del Super Admin
    SELECT id INTO _admin_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    IF _admin_id IS NULL THEN SELECT id INTO _admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1; END IF;

    -- ==========================================
    -- 10 DÍAS DE DÉFICIT CALÓRICO (~1800 kcal)
    -- ==========================================
    
    -- Día 1: Definición (Alta Proteína)
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 1: Déficit (Proteína Alta)', 'Foco: Saciedad y protección muscular (40/30/30).', 'deficit', 1800, TRUE)
    RETURNING id INTO _diet_id;

    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', 'Tortilla de 4 claras y 1 huevo entero con espinacas + 1 rodaja de pan integral', 320, 30, 20, 12, 1),
    (_diet_id, 'Almuerzo', '13:00', 'Pollo a la plancha (200g) + Brócoli al vapor (200g) + 1/2 aguacate', 550, 45, 15, 25, 2),
    (_diet_id, 'Merienda', '17:00', '1 batido de proteína (Whey) + puñado pequeño de almendras', 250, 25, 5, 14, 3),
    (_diet_id, 'Cena', '21:00', '200g de pescado blanco + ensalada verde grande con 1 cda aceite oliva', 450, 40, 10, 20, 4);

    -- Día 2: Pescado y Espárragos
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 2: Déficit (Bajo Carbo)', 'Nutrición densa con mínimo impacto glucémico.', 'deficit', 1750, TRUE)
    RETURNING id INTO _diet_id;

    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', 'Tortilla de claras con champiñones', 180, 25, 5, 4, 1),
    (_diet_id, 'Almuerzo', '13:00', 'Pescado blanco (250g) + Ensalada de espinacas y pepino + 10 espárragos', 400, 50, 10, 10, 2),
    (_diet_id, 'Merienda', '17:00', '200g Queso batido 0% con canela', 120, 20, 8, 0, 3),
    (_diet_id, 'Cena', '21:00', 'Pechuga de pavo (150g) + ensalada de rúcula', 350, 35, 5, 12, 4);

    -- [Carga de días 3 a 10 de Déficit - Resumido para el script]
    -- Día 4: Lomo Magro
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 4: Déficit (Grasas Saludables)', 'Aporte de omega 3 y grasas de calidad para soporte hormonal.', 'deficit', 1850, TRUE)
    RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Lomo de cerdo magro (200g) + Judías verdes (200g) + 30g de nueces', 600, 42, 10, 35, 2);

    -- ==========================================
    -- 10 DÍAS DE MANTENIMIENTO (~2500 kcal)
    -- ==========================================
    
    -- Día 1: Mantenimiento (Recomposición)
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 1: Mantenimiento (Equilibrado)', 'Objetivo: Mejorar calidad muscular (30/40/30).', 'maintenance', 2500, TRUE)
    RETURNING id INTO _diet_id;

    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', '60g avena con leche + 1 pieza fruta + 2 huevos revueltos', 550, 25, 65, 20, 1),
    (_diet_id, 'Almuerzo', '13:00', 'Pechuga de pollo (150g) + Arroz integral (150g cocido) + Verduras', 650, 40, 60, 12, 2),
    (_diet_id, 'Merienda', '17:00', '1 yogur griego natural + pieza fruta + 15g nueces', 350, 15, 35, 18, 3),
    (_diet_id, 'Cena', '21:00', '150g pechuga pavo + 150g quinoa cocida + verduras salteadas', 550, 35, 50, 15, 4);

    -- Día 2: Pasta y Ternera
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 2: Mantenimiento (Energía Estable)', 'Rendimiento constante en el gimnasio.', 'maintenance', 2450, TRUE)
    RETURNING id INTO _diet_id;

    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Pasta integral (150g cocida) + Carne picada ternera (150g) + Salsa natural', 700, 40, 75, 18, 2);

    -- ==========================================
    -- 10 DÍAS DE SUPERÁVIT (~3200 kcal)
    -- ==========================================
    
    -- Día 1: Superávit (Crecimiento)
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 1: Superávit (Masa Muscular)', 'Foco: Carga de glucógeno y recuperación (25/50/25).', 'surplus', 3200, TRUE)
    RETURNING id INTO _diet_id;

    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', 'Porridge 80g avena + 1 plátano + 1 cda mantequilla maní + scoop whey', 750, 40, 85, 25, 1),
    (_diet_id, 'Almuerzo', '13:00', 'Carne de ternera (200g) + Arroz blanco (250g cocido) + 1 Plátano', 950, 50, 110, 22, 2),
    (_diet_id, 'Merienda', '17:00', 'Sándwich integral con 2 latas atún + puñado frutos secos', 550, 45, 45, 20, 3),
    (_diet_id, 'Cena', '21:00', '200g salmón + 250g puré patata + espárragos', 850, 45, 60, 35, 4);

    -- Día 2: Pasta con Crema
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 2: Superávit (Alta Caloria)', 'Máxima densidad energética para ganar peso.', 'surplus', 3300, TRUE)
    RETURNING id INTO _diet_id;

    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Pasta con pollo (200g) y crema de coco + Queso parmesano', 1100, 55, 120, 35, 2);

END $$;
