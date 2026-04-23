-- Cargar Rutinas Nivel Avanzado (Asignadas al Super Admin)
DO $$
DECLARE
    _super_admin_id UUID;
    _prog_adv_id UUID;
    _work_empuje_id UUID;
    _work_traccion_id UUID;
    _work_pierna_cuad_id UUID;
    _work_torso_id UUID;
    _work_pierna_post_id UUID;
BEGIN
    -- Obtener el ID del Super Admin
    SELECT id INTO _super_admin_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    
    IF _super_admin_id IS NULL THEN
        SELECT id INTO _super_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    END IF;

    IF _super_admin_id IS NULL THEN
        RAISE NOTICE 'No se encontró un administrador para asignar los programas.';
        RETURN;
    END IF;

    -- PROGRAMA: Pérdida de Grasa - Nivel Avanzado (PPL + Upper/Lower)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_super_admin_id, 'Pérdida de Grasa - Nivel Avanzado (PPL + Upper/Lower)', 'Enfoque en gestión de fatiga y especificidad extrema. Estructura de 5 días para atletas experimentados en déficit calórico.', TRUE)
    RETURNING id INTO _prog_adv_id;

    -- Lunes: Empuje (Fuerza)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_adv_id, 'Lunes: Empuje (Fuerza)', 1)
    RETURNING id INTO _work_empuje_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_empuje_id, 'Press banca con barra', 4, 6, 180, 1),
    (_work_empuje_id, 'Press militar con barra de pie', 3, 8, 120, 2),
    (_work_empuje_id, 'Press inclinado con mancuernas', 3, 10, 90, 3),
    (_work_empuje_id, 'Fondos en paralelas (pecho)', 3, 10, 90, 4),
    (_work_empuje_id, 'Elevaciones laterales en polea', 4, 15, 60, 5),
    (_work_empuje_id, 'Press francés con barra Z', 3, 12, 60, 6);

    -- Martes: Tracción (Fuerza)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_adv_id, 'Martes: Tracción (Fuerza)', 2)
    RETURNING id INTO _work_traccion_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_traccion_id, 'Dominadas agarre prono', 4, 8, 120, 1),
    (_work_traccion_id, 'Remo con barra agarre supino', 3, 8, 120, 2),
    (_work_traccion_id, 'Remo con mancuerna a una mano', 3, 10, 90, 3),
    (_work_traccion_id, 'Face pull', 3, 15, 60, 4),
    (_work_traccion_id, 'Curl con barra recta', 3, 10, 60, 5),
    (_work_traccion_id, 'Curl Zottman', 3, 12, 60, 6);

    -- Miércoles: Piernas (Enfoque Cuádriceps)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_adv_id, 'Miércoles: Piernas (Cuádriceps)', 3)
    RETURNING id INTO _work_pierna_cuad_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_pierna_cuad_id, 'Sentadilla frontal', 4, 8, 150, 1),
    (_work_pierna_cuad_id, 'Sentadilla hack', 3, 12, 120, 2),
    (_work_pierna_cuad_id, 'Sentadilla sissy', 3, 15, 60, 3),
    (_work_pierna_cuad_id, 'Nordic curl', 3, 8, 90, 4),
    (_work_pierna_cuad_id, 'Prensa de piernas 45°', 3, 20, 90, 5),
    (_work_pierna_cuad_id, 'Farmer''s walk', 3, 1, 90, 6);

    -- Jueves: Torso (Hipertrofia y Detalle)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_adv_id, 'Jueves: Torso (Hipertrofia/Detalle)', 4)
    RETURNING id INTO _work_torso_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_torso_id, 'Press en máquina Smith', 3, 12, 90, 1),
    (_work_torso_id, 'Jalón al pecho agarre cerrado', 3, 12, 60, 2),
    (_work_torso_id, 'Aperturas inclinadas con mancuernas', 3, 15, 60, 3),
    (_work_torso_id, 'Pullover en polea alta', 3, 15, 60, 4),
    (_work_torso_id, 'Curl araña (spider curl)', 3, 12, 60, 5),
    (_work_torso_id, 'Extensión de tríceps en polea con cuerda', 3, 15, 60, 6);

    -- Viernes: Piernas (Enfoque Cadena Posterior)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_adv_id, 'Viernes: Piernas (Cadena Posterior)', 5)
    RETURNING id INTO _work_pierna_post_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_pierna_post_id, 'Peso muerto sumo', 4, 5, 180, 1),
    (_work_pierna_post_id, 'Hip thrust con barra', 3, 10, 120, 2),
    (_work_pierna_post_id, 'Sentadilla búlgara', 3, 12, 90, 3),
    (_work_pierna_post_id, 'Peso muerto rumano con barra', 3, 12, 90, 4),
    (_work_pierna_post_id, 'Pájaros en pec deck invertido', 4, 20, 60, 5),
    (_work_pierna_post_id, 'Elevación de talones sentado en máquina', 4, 15, 60, 6);

END $$;
