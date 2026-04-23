-- CARGA COMPLETA: 30 DÍAS DE DIETAS PROFESIONALES (Déficit, Mantenimiento, Superávit)
DO $$
DECLARE
    _admin_id UUID;
    _diet_id UUID;
BEGIN
    -- Obtener ID del Super Admin
    SELECT id INTO _admin_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    IF _admin_id IS NULL THEN SELECT id INTO _admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1; END IF;

    -- =========================================================================
    -- BLOQUE 1: 10 DÍAS DE DÉFICIT CALÓRICO (~1800 kcal - 40%P / 30%C / 30%G)
    -- =========================================================================
    
    -- DÍA 1
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 1: Déficit (Pollo y Brócoli)', 'Foco: Saciedad y protección muscular.', 'deficit', 1800, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', 'Tortilla de 4 claras y 1 huevo entero con espinacas + 1 rodaja de pan integral', 320, 30, 20, 12, 1),
    (_diet_id, 'Almuerzo', '13:00', 'Pollo a la plancha (200g) + Brócoli al vapor (200g) + 1/2 aguacate', 550, 45, 15, 25, 2),
    (_diet_id, 'Merienda', '17:00', '1 batido de proteína (Whey) + puñado de almendras', 250, 25, 5, 14, 3),
    (_diet_id, 'Cena', '21:00', 'Pescado blanco (200g) + ensalada verde grande con aceite de oliva', 680, 40, 10, 25, 4);

    -- DÍA 2
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 2: Déficit (Pescado y Espárragos)', 'Densidad nutricional máxima.', 'deficit', 1780, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Pescado blanco (250g) + Ensalada de espinacas y pepino + 10 espárragos trigueros', 450, 50, 10, 15, 2);

    -- DÍA 3
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 3: Déficit (Huevo y Atún)', 'Proteína rápida y efectiva.', 'deficit', 1820, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Tortilla de 5 claras y 1 huevo con atún natural + Tomate picado con orégano', 500, 55, 8, 22, 2);

    -- DÍA 4
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 4: Déficit (Lomo y Nueces)', 'Lumbares y soporte hormonal.', 'deficit', 1850, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Lomo de cerdo magro (200g) + Judías verdes (200g) + 30g de nueces', 620, 40, 12, 38, 2);

    -- DÍA 5
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 5: Déficit (Salmón)', 'Rico en Omega-3.', 'deficit', 1800, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Salmón (150g) + Ensalada verde grande + Limón', 520, 35, 10, 32, 2);

    -- DÍA 6 a 10 (Continuación de Definición)
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 6: Déficit (Pavo y Calabacín)', 'Cena ligera de alta digestión.', 'deficit', 1700, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Pechuga de pavo (200g) + Calabacín a la plancha + 1 yogur griego 0%', 480, 55, 15, 6, 2);

    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 7: Déficit (Ternera Magra)', 'Aporte de Hierro y Creatina natural.', 'deficit', 1850, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Ternera magra (180g) + Champiñones salteados + Ensalada de rúcula', 500, 45, 10, 22, 2);

    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 10: Déficit (Queso y Proteína)', 'Cena ligera e hiperproteica.', 'deficit', 1650, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Cena', '21:00', 'Queso batido 0% (250g) con proteína en polvo + 10 fresas', 350, 45, 25, 2, 4);

    -- =========================================================================
    -- BLOQUE 2: 10 DÍAS DE MANTENIMIENTO (~2500 kcal - 30%P / 40%C / 30%G)
    -- =========================================================================

    -- DÍA 1
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 1: Mantenimiento (Pollo y Arroz)', 'Balance perfecto para recomposición muscular.', 'maintenance', 2500, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', '60g avena + leche descremada + 1 fruta + 2 huevos revueltos', 550, 25, 65, 18, 1),
    (_diet_id, 'Almuerzo', '13:00', 'Pechuga de pollo (150g) + Arroz integral (150g cocido) + Verduras', 650, 40, 65, 12, 2);

    -- DÍA 2
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 2: Mantenimiento (Pasta Boloñesa)', 'Carbohidratos complejos para el entrenamiento.', 'maintenance', 2550, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Pasta integral (150g cocida) + Carne picada de ternera (150g) + Salsa tomate', 750, 42, 85, 22, 2);

    -- DÍA 3 a 10 (Mantenimiento)
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 3: Mantenimiento (Lentejas)', 'Energía estable de absorción lenta.', 'maintenance', 2480, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Lentejas estofadas con verduras y pechuga de pavo picada', 600, 35, 75, 8, 2);

    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 8: Mantenimiento (Avena Power)', 'Enfoque en recuperación matutina.', 'maintenance', 2450, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', 'Bowl de Avena (60g en seco) + Leche descremada + 1 scoop proteína + Arándanos', 520, 38, 65, 10, 1);

    -- =========================================================================
    -- BLOQUE 3: 10 DÍAS DE SUPERÁVIT (~3200 kcal - 25%P / 50%C / 25%G)
    -- =========================================================================

    -- DÍA 1
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 1: Superávit (Volumen Base)', 'Crecimiento muscular agresivo y recuperación.', 'surplus', 3200, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Desayuno', '08:00', 'Porridge 80g avena + 1 plátano + 1 cda mantequilla cada maní + scoop whey', 750, 42, 85, 25, 1),
    (_diet_id, 'Almuerzo', '13:00', 'Carne de ternera (200g) + Arroz blanco (250g cocido) + 1 Plátano', 980, 50, 120, 25, 2);

    -- DÍA 2
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 2: Superávit (Pasta y Crema)', 'Máxima carga de glucógeno.', 'surplus', 3300, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Pasta con pollo (200g) y crema de coco + Queso parmesano', 1100, 55, 130, 38, 2);

    -- DÍA 5
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 5: Superávit (Salmón y Puré)', 'Densidad calórica saludable.', 'surplus', 3250, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Almuerzo', '13:00', 'Salmón (200g) + Puré de patatas (300g) + Aceite de oliva extra', 1150, 45, 90, 55, 2);

    -- DÍA 10
    INSERT INTO public.diets (coach_id, title, description, objective, calories_target, is_template)
    VALUES (_admin_id, 'Día 10: Superávit (Batido Masivo)', 'Comida líquida de alta caloría para el post-entreno.', 'surplus', 3400, TRUE) RETURNING id INTO _diet_id;
    INSERT INTO public.diet_meals (diet_id, meal_name, time_of_day, foods, calories, protein_g, carbs_g, fat_g, sort_order) VALUES
    (_diet_id, 'Cena', '21:00', 'Batido: Proteína + 1 taza avena + 1 cda cacao + Leche entera', 850, 45, 110, 25, 4);

END $$;
