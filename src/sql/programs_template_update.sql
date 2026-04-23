-- 1. Actualizar esquema para soportar Plantillas Globales
ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE;

-- 2. Actualizar RLS para permitir visibilidad global de plantillas
DROP POLICY IF EXISTS "Anyone can read template programs" ON public.programs;
CREATE POLICY "Anyone can read template programs"
  ON public.programs FOR SELECT
  TO authenticated
  USING (is_template = true OR coach_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can read template workouts" ON public.workouts;
CREATE POLICY "Anyone can read template workouts"
  ON public.workouts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.programs
      WHERE programs.id = workouts.program_id
      AND (programs.is_template = true OR programs.coach_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Anyone can read template exercises" ON public.exercises;
CREATE POLICY "Anyone can read template exercises"
  ON public.exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workouts w
      JOIN public.programs p ON p.id = w.program_id
      WHERE w.id = exercises.workout_id
      AND (p.is_template = true OR p.coach_id = auth.uid())
    )
  );

-- 3. Cargar Rutinas Solicitadas (Asignadas al Super Admin)
DO $$
DECLARE
    _super_admin_id UUID;
    _prog_fb_id UUID;
    _prog_ppl_id UUID;
    _work_fb_id UUID;
    _work_push_id UUID;
    _work_pull_id UUID;
    _work_legs_id UUID;
BEGIN
    -- Intentar obtener el ID del Super Admin (por rol o por el email del usuario actual)
    SELECT id INTO _super_admin_id FROM public.profiles WHERE role = 'super_admin' LIMIT 1;
    
    -- Si no hay super_admin, usamos el primer admin que encontremos
    IF _super_admin_id IS NULL THEN
        SELECT id INTO _super_admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
    END IF;

    -- Si aún así no hay, salimos (no debería pasar en un entorno real)
    IF _super_admin_id IS NULL THEN
        RAISE NOTICE 'No se encontró un administrador para asignar los programas.';
        RETURN;
    END IF;

    -- PROGRAMA 1: Full Body Principiante
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_super_admin_id, 'Pérdida de Grasa - Principiante (Full Body)', 'Rutina eficiente para maximizar el gasto energético y preservar el músculo en déficit calórico. 3 días por semana alternos.', TRUE)
    RETURNING id INTO _prog_fb_id;

    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_fb_id, 'Cuerpo Completo (A)', 1)
    RETURNING id INTO _work_fb_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_fb_id, 'Sentadilla con barra (back squat)', 3, 12, 90, 1),
    (_work_fb_id, 'Press plano con mancuernas', 3, 12, 60, 2),
    (_work_fb_id, 'Jalón al pecho agarre amplio', 3, 12, 60, 3),
    (_work_fb_id, 'Peso muerto rumano con mancuernas', 3, 12, 90, 4),
    (_work_fb_id, 'Press con mancuernas sentado', 3, 12, 60, 5),
    (_work_fb_id, 'Plancha frontal', 3, 45, 60, 6);

    -- PROGRAMA 2: Push/Pull/Legs Principiante
    INSERT INTO public.programs (coach_id, name, description, is_template)
    VALUES (_super_admin_id, 'Principiante - División Push/Pull/Legs', 'División por grupos musculares para optimizar recuperación y aprendizaje técnico. Realizar en orden Empuje, Tracción, Piernas.', TRUE)
    RETURNING id INTO _prog_ppl_id;

    -- Rutina Empuje
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_ppl_id, 'Día 1: Empuje (Pecho/Hombro/Tríceps)', 1)
    RETURNING id INTO _work_push_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_push_id, 'Press plano con mancuernas', 3, 12, 60, 1),
    (_work_push_id, 'Press con mancuernas sentado', 3, 12, 60, 2),
    (_work_push_id, 'Pec deck (mariposa)', 3, 12, 60, 3),
    (_work_push_id, 'Flexiones de pecho', 3, 15, 60, 4),
    (_work_push_id, 'Press inclinado con mancuernas', 3, 12, 60, 5),
    (_work_push_id, 'Elevaciones laterales con mancuernas', 3, 15, 60, 6),
    (_work_push_id, 'Extensión de tríceps en polea con cuerda', 3, 15, 60, 7),
    (_work_push_id, 'Press francés con mancuernas', 3, 12, 60, 8),
    (_work_push_id, 'Fondos en banco', 3, 12, 60, 9),
    (_work_push_id, 'Press en máquina de hombros', 3, 12, 60, 10);

    -- Rutina Tracción
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_ppl_id, 'Día 2: Tracción (Espalda/Bíceps)', 2)
    RETURNING id INTO _work_pull_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_pull_id, 'Jalón al pecho agarre amplio', 3, 12, 60, 1),
    (_work_pull_id, 'Remo sentado en polea baja', 3, 12, 60, 2),
    (_work_pull_id, 'Remo con mancuerna a una mano', 3, 12, 60, 3),
    (_work_pull_id, 'Pullover en polea alta', 3, 15, 60, 4),
    (_work_pull_id, 'Remo en máquina Hammer', 3, 12, 60, 5),
    (_work_pull_id, 'Dominadas asistidas', 3, 10, 90, 6),
    (_work_pull_id, 'Curl con mancuernas alterno', 3, 12, 60, 7),
    (_work_pull_id, 'Curl martillo', 3, 12, 60, 8),
    (_work_pull_id, 'Face pull', 3, 15, 60, 9),
    (_work_pull_id, 'Encogimientos con mancuernas', 3, 15, 60, 10);

    -- Rutina Piernas
    INSERT INTO public.workouts (program_id, name, day_order)
    VALUES (_prog_ppl_id, 'Día 3: Piernas y Glúteos', 3)
    RETURNING id INTO _work_legs_id;

    INSERT INTO public.exercises (workout_id, name, sets, reps, rest_seconds, order_index) VALUES
    (_work_legs_id, 'Prensa de piernas 45°', 3, 12, 90, 1),
    (_work_legs_id, 'Sentadilla goblet', 3, 12, 60, 2),
    (_work_legs_id, 'Extensiones de pierna en máquina', 3, 15, 60, 3),
    (_work_legs_id, 'Curl femoral sentado', 3, 15, 60, 4),
    (_work_legs_id, 'Zancadas con mancuernas', 3, 12, 60, 5),
    (_work_legs_id, 'Peso muerto rumano con mancuernas', 3, 12, 90, 6),
    (_work_legs_id, 'Hip thrust en máquina', 3, 12, 90, 7),
    (_work_legs_id, 'Abducción de cadera en máquina', 3, 15, 60, 8),
    (_work_legs_id, 'Elevación de talones de pie en máquina', 3, 15, 60, 9),
    (_work_legs_id, 'Step-up con mancuernas', 3, 12, 60, 10);

END $$;
