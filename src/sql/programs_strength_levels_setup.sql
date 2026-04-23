-- MODIFICACIÓN DE ESQUEMA Y CARGA DE FUERZA PROGRESIVA
DO $$
DECLARE
    _admin_id UUID;
    _prog_id UUID;
    _work_id UUID;
BEGIN
    -- 1. Añadir columna 'level' a programs si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'programs' AND column_name = 'level') THEN
        ALTER TABLE public.programs ADD COLUMN level TEXT DEFAULT 'intermedio';
    END IF;

    -- Obtener ID del Super Admin
    SELECT id INTO _admin_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    IF _admin_id IS NULL THEN SELECT id INTO _admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1; END IF;

    -- 2. Actualizar programas existentes según su nombre
    UPDATE public.programs SET level = 'principiante' WHERE name ILIKE '%Principiante%';
    UPDATE public.programs SET level = 'intermedio' WHERE name ILIKE '%Intermedio%';
    UPDATE public.programs SET level = 'avanzado' WHERE name ILIKE '%Avanzado%';

    -- 3. Cargar Programas de FUERZA PROGRESIVA

    -- Fuerza Progresiva: Principiante (3 días)
    INSERT INTO public.programs (coach_id, name, description, is_template, level)
    VALUES (_admin_id, 'Fuerza Progresiva: Principiante', 'Construye una base sólida de fuerza con movimientos fundamentales. Foco: Técnica y Sobrecarga Progresiva.', TRUE, 'principiante')
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día A: Fundamentos', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Sentadilla con barra (back squat)', 3, 10, 120, 1),
    (_work_id, 'Press banca con barra', 3, 10, 90, 2),
    (_work_id, 'Remo con mancuerna a una mano', 3, 12, 90, 3),
    (_work_id, 'Hiperextensiones', 3, 15, 60, 4);

    -- Fuerza Progresiva: Intermedio (4 días - Torso/Pierna)
    INSERT INTO public.programs (coach_id, name, description, is_template, level)
    VALUES (_admin_id, 'Fuerza Progresiva: Intermedio', 'Incrementa el volumen y la intensidad. División Torso/Pierna para maximizar la frecuencia y recuperación.', TRUE, 'intermedio')
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día 1: Torso (Fuerza)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press militar con barra de pie', 4, 8, 120, 1),
    (_work_id, 'Dominadas agarre prono', 4, 8, 120, 2),
    (_work_id, 'Press inclinado con mancuernas', 3, 10, 90, 3),
    (_work_id, 'Remo con barra agarre prono', 3, 10, 90, 4);

    -- Fuerza Progresiva: Avanzado (5 días - PPL + Power)
    INSERT INTO public.programs (coach_id, name, description, is_template, level)
    VALUES (_admin_id, 'Fuerza Progresiva: Avanzado', 'Enfoque en records personales (PRs) y periodización lineal. Máxima demanda neuromuscular.', TRUE, 'avanzado')
    RETURNING id INTO _prog_id;
    
    INSERT INTO public.workouts (program_id, name, day_order) VALUES (_prog_id, 'Día 1: Empuje (Max Power)', 1) RETURNING id INTO _work_id;
    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_id, 'Press banca con barra', 5, 5, 180, 1),
    (_work_id, 'Press militar con barra (estricto)', 4, 6, 120, 2),
    (_work_id, 'Fondos en paralelas con lastre', 3, 8, 90, 3),
    (_work_id, 'Press de hombros en máquina Smith', 3, 10, 90, 4);

END $$;
