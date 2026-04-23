-- =============================================
-- FitCoach Pro — Complete Auth & Profile Setup
-- profiles.role is the SINGLE source of truth
-- No user_roles table needed
-- =============================================

-- 1. Ensure profiles has a role column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client';

-- 2. Updated handle_new_user trigger
-- Assigns role directly in profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role text;
  _gym_id uuid;
  _gym_name text;
  _status text;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  _gym_id := (NEW.raw_user_meta_data->>'gym_id')::uuid;
  _gym_name := NEW.raw_user_meta_data->>'gym_name';
  _status := 'active';

  -- If registering as admin with a gym_name, create the gym
  IF _role = 'admin' AND _gym_name IS NOT NULL AND _gym_name != '' THEN
    INSERT INTO public.gyms (name, status)
    VALUES (_gym_name, 'active')
    RETURNING id INTO _gym_id;
  END IF;

  -- Create profile with role
  INSERT INTO public.profiles (id, full_name, avatar_url, gym_id, status, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    _gym_id,
    _status,
    _role
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    gym_id = COALESCE(EXCLUDED.gym_id, profiles.gym_id),
    status = EXCLUDED.status,
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
END;
$$;

-- 3. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Helper functions using profiles.role

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

CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'super_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_gym_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gym_id FROM public.profiles WHERE id = _user_id
$$;

-- 5. RLS policies for profiles

-- Super admin full access
DROP POLICY IF EXISTS "Super admins full access profiles" ON public.profiles;
CREATE POLICY "Super admins full access profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Users can read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Gym members can see each other
DROP POLICY IF EXISTS "Gym members can read gym profiles" ON public.profiles;
CREATE POLICY "Gym members can read gym profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    gym_id IS NOT NULL 
    AND gym_id = public.get_user_gym_id(auth.uid())
  );

-- Users can update own profile
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert own profile (for trigger)
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 6. Update gym_member_counts view to use profiles.role
CREATE OR REPLACE VIEW public.gym_member_counts AS
SELECT
  g.id AS gym_id,
  COALESCE(coach_counts.count, 0) AS coach_count,
  COALESCE(client_counts.count, 0) AS client_count
FROM public.gyms g
LEFT JOIN (
  SELECT gym_id, COUNT(*) AS count
  FROM public.profiles
  WHERE role = 'coach'
  GROUP BY gym_id
) coach_counts ON coach_counts.gym_id = g.id
LEFT JOIN (
  SELECT gym_id, COUNT(*) AS count
  FROM public.profiles
  WHERE role = 'client'
  GROUP BY gym_id
) client_counts ON client_counts.gym_id = g.id;

-- =============================================
-- Done! No more user_roles dependency.
-- =============================================
