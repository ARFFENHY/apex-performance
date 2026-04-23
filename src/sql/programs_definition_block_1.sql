-- BLOQUE 1: DEFINICIÓN (10 Programas Globales)
DO $$
DECLARE
    _admin_id UUID;
    _prog_id UUID;
    _work_id UUID;
BEGIN
    -- Obtener ID del Super Admin
    SELECT id INTO _admin_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    IF _admin_id IS NULL THEN SELECT id INTO _admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1; END IF;

    -- 1. Full Body "Los 5 Grandes" (3 días/semana)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Full Body "Los 5 Grandes"', 'Enfoque en fuerza pura con los ejercicios más básicos. 5 series de 5 repeticiones para preservar la carga máxima en déficit.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Los 5 Grandes (Fuerza)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Sentadilla con barra (back squat)', 5, 5, 180, 1),
    (_work_id, 'Peso muerto convencional', 5, 5, 180, 2),
    (_work_id, 'Press banca con barra', 5, 5, 120, 3),
    (_work_id, 'Press militar con barra de pie', 5, 5, 120, 4),
    (_work_id, 'Dominadas agarre prono', 5, 5, 120, 5);

    -- 2. Torso/Pierna Power (4 días/semana)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Torso/Pierna Power', 'División de 4 días enfocada en intensidad. Rango de 6-8 repeticiones pesadas para dar una señal clara de preservación muscular.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día 1: Torso (Pesado)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 3, 8, 120, 1),
    (_work_id, 'Remo con barra agarre prono', 3, 8, 90, 2),
    (_work_id, 'Press militar con barra de pie', 3, 8, 90, 3),
    (_work_id, 'Jalón al pecho agarre amplio', 3, 10, 60, 4);

    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día 2: Pierna (Pesado)', 2) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Sentadilla con barra (back squat)', 3, 8, 150, 1),
    (_work_id, 'Peso muerto rumano con barra', 3, 10, 120, 2),
    (_work_id, 'Prensa de piernas 45°', 3, 12, 90, 3),
    (_work_id, 'Elevación de talones en prensa', 3, 15, 60, 4);

    -- 3. Rutina de Mantenimiento (Mínimo Efectivo - 2 días)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Mantenimiento (Mínimo Efectivo)', 'Para quienes tienen poco tiempo. Frecuencia de 2 días con todo el volumen necesario para no perder lo ganado.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Sesión Full Body A', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Sentadilla con barra (back squat)', 3, 10, 120, 1),
    (_work_id, 'Press banca con barra', 3, 10, 90, 2),
    (_work_id, 'Dominadas agarre prono', 3, 8, 90, 3),
    (_work_id, 'Press con mancuernas sentado', 2, 12, 60, 4),
    (_work_id, 'Plancha frontal', 3, 60, 60, 5);

    -- 4. Circuito Metabólico de Pesas
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Circuito Metabólico', '6 ejercicios multiarticulares sin descanso entre ellos. 3 rondas totales. Maximiza el gasto calórico manteniendo la tensión.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Circuito de Quema', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Sentadilla goblet', 3, 15, 0, 1),
    (_work_id, 'Flexiones de pecho', 3, 15, 0, 2),
    (_work_id, 'Remo con mancuerna a una mano', 3, 12, 0, 3),
    (_work_id, 'Zancadas con mancuernas', 3, 20, 0, 4),
    (_work_id, 'Press con mancuernas sentado', 3, 12, 0, 5),
    (_work_id, 'Burpees', 3, 10, 120, 6);

    -- 5. Empuje / Tracción (Push/Pull)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Empuje / Tracción (Push/Pull)', 'División del cuerpo en movimientos de empuje y tirón. Permite una recuperación óptima en déficit.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día de Empuje (Push)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 3, 8, 120, 1),
    (_work_id, 'Press militar con barra de pie', 3, 10, 90, 2),
    (_work_id, 'Sentadilla con barra (back squat)', 3, 10, 120, 3),
    (_work_id, 'Extensión de tríceps en polea con cuerda', 3, 15, 60, 4);

    -- 6. Rutina de Densidad (Descanso 45s)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Rutina de Densidad', 'Mismo trabajo de siempre pero reduciendo los descansos a 45 segundos para obligar al cuerpo a ser eficiente.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día de Densidad Torso', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press inclinado con mancuernas', 3, 12, 45, 1),
    (_work_id, 'Remo sentado en polea baja', 3, 12, 45, 2),
    (_work_id, 'Elevaciones laterales con mancuernas', 3, 15, 45, 3),
    (_work_id, 'Curl con mancuernas alterno', 3, 12, 45, 4);

    -- 7. Upper / Lower + HIIT
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Upper / Lower + HIIT', '4 días de pesas pesadas seguidos de 15 min de intervalos de alta intensidad en cardio.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día Superior + HIIT', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 3, 8, 120, 1),
    (_work_id, 'Remo con barra agarre supino', 3, 10, 90, 2),
    (_work_id, 'Press Arnold', 3, 12, 60, 3),
    (_work_id, 'Burpees (Intervalos)', 5, 1, 30, 4);

    -- 8. Rutina Funcional con Pesas
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Rutina Funcional', 'Incluye movimientos explosivos y dinámicos para elevar pulsaciones y mejorar la coordinación en déficit.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Funcional Power', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Clean (cargada)', 4, 6, 120, 1),
    (_work_id, 'Zancadas caminando', 3, 20, 60, 2),
    (_work_id, 'Kettlebell swing', 3, 20, 60, 3),
    (_work_id, 'Battle ropes', 4, 1, 45, 4);

    -- 9. Especial de Cadena Posterior
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Especial Cadena Posterior', 'Enfoque en Peso Muerto y Remos para mantener la postura y densidad mientras bajas de grasa.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día de Espalda y Pierna Post', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Peso muerto convencional', 4, 6, 180, 1),
    (_work_id, 'Remo con barra agarre prono', 3, 8, 90, 2),
    (_work_id, 'Hiperextensiones', 3, 15, 60, 3),
    (_work_id, 'Face pull', 3, 15, 60, 4);

    -- 10. Rutina Rest-Pause (Heavy)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Definición: Rest-Pause (Alta Intensidad)', 'Hacer una serie pesada, descansar 15s y hacer 2-3 reps extra. Fatiga muscular rápida y efectiva.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Sesión Rest-Pause', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 3, 10, 15, 1), -- El descanso de 15s es parte de la técnica
    (_work_id, 'Prensa de piernas 45°', 3, 12, 15, 2),
    (_work_id, 'Jalón al pecho agarre amplio', 3, 10, 15, 3),
    (_work_id, 'Curl martillo', 3, 12, 60, 4);

END $$;
