-- Cargar Rutinas Nivel Intermedio (Asignadas al Super Admin)
DO $$
DECLARE
    _super_admin_id UUID;
    _prog_int_id UUID;
    _work_torso_a_id UUID;
    _work_pierna_a_id UUID;
    _work_torso_b_id UUID;
    _work_pierna_b_id UUID;
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

    -- PROGRAMA: Pérdida de Grasa - Nivel Intermedio (Torso/Pierna)
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_super_admin_id, 'Pérdida de Grasa - Nivel Intermedio (Torso/Pierna)', 'Enfoque en hipertrofia y fuerza específica. División de 4 días (Torso/Pierna) para entrenar cada músculo dos veces por semana.', TRUE)
    RETURNING id INTO _prog_int_id;

    -- Lunes: Torso A (Empuje y Fuerza)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_int_id, 'Lunes: Torso A (Empuje y Fuerza)', 1)
    RETURNING id INTO _work_torso_a_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_torso_a_id, 'Press banca con barra', 3, 8, 120, 1),
    (_work_torso_a_id, 'Remo con barra agarre prono', 3, 10, 90, 2),
    (_work_torso_a_id, 'Press militar con barra de pie', 3, 10, 90, 3),
    (_work_torso_a_id, 'Jalón al pecho agarre amplio', 3, 12, 60, 4),
    (_work_torso_a_id, 'Fondos en paralelas (pecho)', 3, 10, 60, 5),
    (_work_torso_a_id, 'Face pull', 3, 15, 60, 6),
    (_work_torso_a_id, 'Curl con barra Z', 3, 12, 60, 7);

    -- Martes: Pierna A (Enfoque en Cuádriceps)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_int_id, 'Martes: Pierna A (Cuádriceps)', 2)
    RETURNING id INTO _work_pierna_a_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_pierna_a_id, 'Sentadilla con barra (back squat)', 3, 8, 120, 1),
    (_work_pierna_a_id, 'Prensa de piernas 45°', 3, 12, 90, 2),
    (_work_pierna_a_id, 'Peso muerto rumano con barra', 3, 12, 90, 3),
    (_work_pierna_a_id, 'Extensiones de pierna en máquina', 3, 15, 60, 4),
    (_work_pierna_a_id, 'Curl femoral sentado', 3, 15, 60, 5),
    (_work_pierna_a_id, 'Elevación de talones en prensa', 4, 15, 60, 6),
    (_work_pierna_a_id, 'Plancha frontal', 3, 60, 60, 7);

    -- Jueves: Torso B (Enfoque en Tracción y Detalle)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_int_id, 'Jueves: Torso B (Tracción y Detalle)', 3)
    RETURNING id INTO _work_torso_b_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_torso_b_id, 'Dominadas agarre prono', 3, 10, 90, 1),
    (_work_torso_b_id, 'Press inclinado con mancuernas', 3, 12, 90, 2),
    (_work_torso_b_id, 'Remo en máquina T', 3, 10, 90, 3),
    (_work_torso_b_id, 'Elevaciones laterales en polea', 4, 15, 60, 4),
    (_work_torso_b_id, 'Crossover en polea alta', 3, 15, 60, 5),
    (_work_torso_b_id, 'Extensión de tríceps sobre la cabeza con mancuerna', 3, 12, 60, 6),
    (_work_torso_b_id, 'Curl en banco inclinado', 3, 12, 60, 7);

    -- Viernes: Pierna B (Enfoque en Cadena Posterior)
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_int_id, 'Viernes: Pierna B (Cadena Posterior)', 4)
    RETURNING id INTO _work_pierna_b_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_pierna_b_id, 'Peso muerto convencional', 3, 6, 120, 1),
    (_work_pierna_b_id, 'Hip thrust con barra', 3, 10, 90, 2),
    (_work_pierna_b_id, 'Sentadilla búlgara', 3, 12, 90, 3),
    (_work_pierna_b_id, 'Curl femoral acostado', 3, 12, 60, 4),
    (_work_pierna_b_id, 'Zancadas caminando', 3, 20, 60, 5),
    (_work_pierna_b_id, 'Elevación de talones de pie en máquina', 4, 12, 60, 6),
    (_work_pierna_b_id, 'Ab wheel rollout', 3, 15, 60, 7);

END $$;
