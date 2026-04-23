-- ============================================
-- Phase 2: Client Workouts (Assignments) + Progress Logs
-- ============================================

-- 1. client_workouts — Assign programs to clients
CREATE TABLE IF NOT EXISTS public.client_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'pausado', 'completado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, program_id)
);

ALTER TABLE public.client_workouts ENABLE ROW LEVEL SECURITY;

-- Coach can manage their own assignments
CREATE POLICY "coach_manage_client_workouts"
  ON public.client_workouts FOR ALL
  TO authenticated
  USING (coach_id = auth.uid())
  WITH CHECK (coach_id = auth.uid());

-- Client can view their own assignments
CREATE POLICY "client_view_own_assignments"
  ON public.client_workouts FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

-- 2. progress_logs — Exercise-level progress tracking
CREATE TABLE IF NOT EXISTS public.progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name TEXT NOT NULL,
  weight REAL,
  reps INT,
  sets INT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.progress_logs ENABLE ROW LEVEL SECURITY;

-- Client can manage their own progress
CREATE POLICY "client_manage_own_progress"
  ON public.progress_logs FOR ALL
  TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Coach can view progress of their clients
CREATE POLICY "coach_view_client_progress"
  ON public.progress_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = progress_logs.client_id
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_workouts_client ON public.client_workouts(client_id);
CREATE INDEX IF NOT EXISTS idx_client_workouts_coach ON public.client_workouts(coach_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_client ON public.progress_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_exercise ON public.progress_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_created ON public.progress_logs(created_at DESC);
