-- BLOQUE 2: SUPERÁVIT / GANANCIA MUSCULAR (10 Programas Globales)
DO $$
DECLARE
    _admin_id UUID;
    _prog_id UUID;
    _work_id UUID;
BEGIN
    -- Obtener ID del Super Admin
    SELECT id INTO _admin_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    IF _admin_id IS NULL THEN SELECT id INTO _admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1; END IF;

    -- 1. Arnold Split (Frecuencia 2)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Arnold Split (Pecho/Espalda)', 'La legendaria división: Pecho y Espalda el mismo día para un bombeo masivo. Volumen altísimo con descansos de 60-90s.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día 1: Pecho y Espalda', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 4, 10, 90, 1),
    (_work_id, 'Dominadas agarre prono', 4, 10, 90, 2),
    (_work_id, 'Press inclinado con mancuernas', 3, 12, 60, 3),
    (_work_id, 'Remo con barra agarre prono', 3, 12, 60, 4),
    (_work_id, 'Crossover en polea alta', 3, 15, 60, 5),
    (_work_id, 'Pullover en polea alta', 3, 15, 60, 6);

    -- 2. PPL Clásico (Push/Pull/Legs)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: PPL Clásico (6 días)', 'Un día para cada función muscular. Ideal para atletas avanzados que pueden entrenar 6 días a la semana.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día 1: Empuje (Push)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 4, 10, 90, 1),
    (_work_id, 'Press militar con barra de pie', 3, 10, 90, 2),
    (_work_id, 'Aperturas inclinadas con mancuernas', 3, 12, 60, 3),
    (_work_id, 'Extensión de tríceps en polea con cuerda', 4, 15, 60, 4);

    -- 3. Bro Split (Un músculo por día)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Bro Split (Músculo por Día)', 'El enfoque clásico de culturismo: Destroza un solo grupo muscular por sesión. Explosión de volumen total.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Lunes: Pecho (International Chest Day)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 5, 12, 90, 1),
    (_work_id, 'Press inclinado con mancuernas', 4, 12, 60, 2),
    (_work_id, 'Pec deck (mariposa)', 4, 15, 60, 3),
    (_work_id, 'Flexiones de pecho', 3, 20, 45, 4);

    -- 4. Hipertrofia Estética de 5 días
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Hipertrofia Estética', 'Enfoque en detalles musculares: hombros redondeados, espalda ancha y brazos definidos. 5 días por semana.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día de Hombros y Brazos', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press Arnold', 4, 12, 60, 1),
    (_work_id, 'Elevaciones laterales con mancuernas', 4, 20, 45, 2),
    (_work_id, 'Curl con barra Z', 3, 12, 60, 3),
    (_work_id, 'Press francés con barra Z', 3, 12, 60, 4);

    -- 5. Especialización de Brazos (Superávit)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Especialización de Brazos', 'Para estancamientos en el tren superior. Incluye un día dedicado exclusivamente a Bíceps y Tríceps.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Arm Day (Bíceps/Tríceps)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Curl predicador con barra Z', 4, 12, 60, 1),
    (_work_id, 'Extensión de tríceps overhead con cuerda', 4, 12, 60, 2),
    (_work_id, 'Curl martillo', 3, 15, 60, 3),
    (_work_id, 'Fondos en banco', 3, 20, 60, 4);

    -- 6. Rutina 8x8 (Vince Gironda)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Rutina 8x8 (Vince Gironda)', 'El "Entrenamiento Honesto". 8 series de 8 repeticiones con solo 30 segundos de descanso. Estrés metabólico extremo.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, '8x8 Sesión Torso', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press inclinado con mancuernas', 8, 8, 30, 1),
    (_work_id, 'Remo sentado en polea baja', 8, 8, 30, 2),
    (_work_id, 'Elevaciones laterales con mancuernas', 8, 8, 30, 3);

    -- 7. German Volume Training (10x10)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: German Volume (10x10)', 'Un ejercicio básico. 10 series de 10 repeticiones. El método más efectivo conocido para romper estancamientos de masa.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, '10x10 Sentadilla', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Sentadilla con barra (back squat)', 10, 10, 90, 1),
    (_work_id, 'Extensiones de pierna en máquina', 3, 15, 60, 2);

    -- 8. Torso/Pierna con énfasis en Estética
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Torso/Pierna Estética', 'Base pesada pero añadiendo ejercicios de aislamiento para "detalles" en hombros y espalda baja.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Torso (Aislamiento)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press de hombros en máquina Smith', 4, 12, 60, 1),
    (_work_id, 'Crossover en polea alta', 3, 15, 60, 2),
    (_work_id, 'Face pull', 3, 20, 60, 3);

    -- 9. Rutina de Contracción Máxima
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Contracción Máxima', 'Enfoque en ejercicios de máquina donde el músculo sufre más en el punto de máxima contracción.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Máxima Hipertropia', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Pec deck (mariposa)', 4, 15, 60, 1),
    (_work_id, 'Extensiones de pierna en máquina', 4, 15, 60, 2),
    (_work_id, 'Curl femoral sentado', 4, 15, 60, 3);

    -- 10. Escalera de Repeticiones (Bulk)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_admin_id, 'Superávit: Escalera de Repeticiones', 'Empieza con 12 reps e ir subiendo las reps en cada serie hasta llegar a 20 bajando ligeramente el peso.', TRUE)
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Escalera de Bombeo', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Prensa de piernas 45°', 4, 15, 60, 1),
    (_work_id, 'Jalón al pecho agarre amplio', 4, 15, 60, 2),
    (_work_id, 'Flexiones de pecho', 4, 20, 60, 3);

END $$;
