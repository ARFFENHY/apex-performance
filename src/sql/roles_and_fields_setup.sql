-- =============================================
-- FitCoach Pro — Roles & Profile Fields Setup
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Add new profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS documento text,
  ADD COLUMN IF NOT EXISTS telefono text,
  ADD COLUMN IF NOT EXISTS especialidad text,
  ADD COLUMN IF NOT EXISTS objetivo text,
  ADD COLUMN IF NOT EXISTS dni text,
  ADD COLUMN IF NOT EXISTS email text;

-- 2. Set super_admin for specific users (by email from auth.users)
UPDATE public.profiles
SET role = 'super_admin', status = 'active'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('arffenhybarazarte@gmail.com', 'arffenhy@gmail.com')
);

-- 3. Create coach_clients table if not exists
CREATE TABLE IF NOT EXISTS public.coach_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

-- RLS for coach_clients
DROP POLICY IF EXISTS "Super admins can manage coach_clients" ON public.coach_clients;
CREATE POLICY "Super admins can manage coach_clients"
  ON public.coach_clients FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Coaches can see own clients" ON public.coach_clients;
CREATE POLICY "Coaches can see own clients"
  ON public.coach_clients FOR SELECT
  TO authenticated
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Coaches can insert own clients" ON public.coach_clients;
CREATE POLICY "Coaches can insert own clients"
  ON public.coach_clients FOR INSERT
  TO authenticated
  WITH CHECK (coach_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage gym coach_clients" ON public.coach_clients;
CREATE POLICY "Admins can manage gym coach_clients"
  ON public.coach_clients FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p1
      WHERE p1.id = auth.uid() AND p1.role = 'admin'
        AND p1.gym_id = (SELECT gym_id FROM public.profiles WHERE id = coach_clients.coach_id)
    )
  );

-- 4. RPC to assign client to coach (with gym validation)
CREATE OR REPLACE FUNCTION public.assign_client_to_coach(_client_id uuid, _coach_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _coach_gym uuid;
  _client_gym uuid;
BEGIN
  SELECT gym_id INTO _coach_gym FROM profiles WHERE id = _coach_id;
  SELECT gym_id INTO _client_gym FROM profiles WHERE id = _client_id;

  IF _coach_gym IS DISTINCT FROM _client_gym THEN
    RAISE EXCEPTION 'Coach and client must belong to the same gym';
  END IF;

  INSERT INTO coach_clients (coach_id, client_id)
  VALUES (_coach_id, _client_id)
  ON CONFLICT (coach_id, client_id) DO NOTHING;
END;
$$;

-- 5. RPC to assign user to gym
CREATE OR REPLACE FUNCTION public.assign_user_to_gym(_user_id uuid, _gym_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles SET gym_id = _gym_id, updated_at = now()
  WHERE id = _user_id;
END;
$$;

-- 6. Update handle_new_user to support new fields
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
  _coach_id uuid;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  _gym_id := (NEW.raw_user_meta_data->>'gym_id')::uuid;
  _gym_name := NEW.raw_user_meta_data->>'gym_name';
  _coach_id := (NEW.raw_user_meta_data->>'coach_id')::uuid;

  IF _role = 'admin' AND _gym_name IS NOT NULL AND _gym_name != '' THEN
    INSERT INTO public.gyms (name, status)
    VALUES (_gym_name, 'active')
    RETURNING id INTO _gym_id;
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, gym_id, status, role, email, documento, telefono, especialidad, objetivo, dni)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    _gym_id,
    'active',
    _role,
    NEW.email,
    NEW.raw_user_meta_data->>'documento',
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'especialidad',
    NEW.raw_user_meta_data->>'objetivo',
    NEW.raw_user_meta_data->>'dni'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    gym_id = COALESCE(EXCLUDED.gym_id, profiles.gym_id),
    status = EXCLUDED.status,
    role = EXCLUDED.role,
    email = COALESCE(EXCLUDED.email, profiles.email),
    documento = COALESCE(EXCLUDED.documento, profiles.documento),
    telefono = COALESCE(EXCLUDED.telefono, profiles.telefono),
    especialidad = COALESCE(EXCLUDED.especialidad, profiles.especialidad),
    objetivo = COALESCE(EXCLUDED.objetivo, profiles.objetivo),
    dni = COALESCE(EXCLUDED.dni, profiles.dni),
    updated_at = now();

  -- Auto-assign client to coach if coach_id provided
  IF _role = 'client' AND _coach_id IS NOT NULL THEN
    INSERT INTO public.coach_clients (coach_id, client_id)
    VALUES (_coach_id, NEW.id)
    ON CONFLICT (coach_id, client_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- 7. Sync email for existing users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- =============================================
-- Done! Roles and fields ready.
-- =============================================
