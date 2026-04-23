-- =============================================
-- FitCoach Pro — Complete SQL Setup Script
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. ENUM for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'client');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Add role column to profiles (single source of truth)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client';

-- Helper function to check roles (reads from profiles.role)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = _role
  )
$$;

-- 4. Auto-assign profile + role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Coach-Clients relationship
CREATE TABLE public.coach_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (coach_id, client_id)
);

ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can read own links"
  ON public.coach_clients FOR SELECT
  TO authenticated
  USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "Authenticated can insert links"
  ON public.coach_clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = coach_id OR auth.uid() = client_id);

-- 6. Invitations
CREATE TABLE public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_role app_role NOT NULL DEFAULT 'client',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own invitations"
  ON public.invitations FOR ALL
  TO authenticated
  USING (auth.uid() = coach_id);

CREATE POLICY "Anyone can read by token"
  ON public.invitations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated can update invitations"
  ON public.invitations FOR UPDATE
  TO authenticated
  USING (true);

-- 7. Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text DEFAULT '',
  read boolean DEFAULT false,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated can insert notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 8. Routines
CREATE TABLE public.routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  duration_minutes integer NOT NULL,
  video_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own routines"
  ON public.routines FOR ALL
  TO authenticated
  USING (auth.uid() = coach_id);

-- 9. Routine Exercises
CREATE TABLE public.routine_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  sets integer DEFAULT 3,
  reps integer DEFAULT 10,
  rest_seconds integer DEFAULT 60,
  order_index integer DEFAULT 0,
  notes text,
  muscle_group text
);

ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage exercises via routine"
  ON public.routine_exercises FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.routines
      WHERE id = routine_exercises.routine_id AND coach_id = auth.uid()
    )
  );

-- 10. Nutrition Plans
CREATE TABLE public.nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  calories integer NOT NULL,
  protein integer NOT NULL,
  carbs integer NOT NULL,
  fat integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.nutrition_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own plans"
  ON public.nutrition_plans FOR ALL
  TO authenticated
  USING (auth.uid() = coach_id);

CREATE POLICY "Clients can read own plans"
  ON public.nutrition_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- 11. Body Progress
CREATE TABLE public.body_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight numeric,
  body_fat numeric,
  muscle_mass numeric,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.body_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own progress"
  ON public.body_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches can read client progress"
  ON public.body_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_id = auth.uid() AND client_id = body_progress.user_id
    )
  );

-- 12. Messages (Chat)
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON public.messages FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received messages"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = receiver_id);

CREATE INDEX idx_messages_participants ON public.messages (sender_id, receiver_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 13. User Achievements
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  key text NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  metadata jsonb,
  UNIQUE (user_id, key)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON public.user_achievements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Coaches can read client achievements"
  ON public.user_achievements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_id = auth.uid() AND client_id = user_achievements.user_id
    )
  );

-- 14. Client Routines (assigned routines to clients)
CREATE TABLE public.client_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notes text,
  assigned_at timestamptz DEFAULT now(),
  UNIQUE (routine_id, client_id)
);

ALTER TABLE public.client_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage assigned routines"
  ON public.client_routines FOR ALL
  TO authenticated
  USING (auth.uid() = coach_id);

CREATE POLICY "Clients can read assigned routines"
  ON public.client_routines FOR SELECT
  TO authenticated
  USING (auth.uid() = client_id);

-- 15. Favorite Routines
CREATE TABLE public.favorite_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (routine_id, user_id)
);

ALTER TABLE public.favorite_routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
  ON public.favorite_routines FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- Done! All tables created with RLS policies.
-- =============================================
