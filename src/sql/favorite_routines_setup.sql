-- =============================================
-- favorite_routines table
-- =============================================

CREATE TABLE IF NOT EXISTS public.favorite_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, routine_id)
);

ALTER TABLE public.favorite_routines ENABLE ROW LEVEL SECURITY;

-- Users can see their own favorites
CREATE POLICY "Users can view own favorites"
  ON public.favorite_routines FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add favorites
CREATE POLICY "Users can insert own favorites"
  ON public.favorite_routines FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can delete own favorites"
  ON public.favorite_routines FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
