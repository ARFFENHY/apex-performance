-- =============================================
-- FitCoach Pro — Multi-Tenant Architecture
-- Run this AFTER setup.sql in your Supabase SQL Editor
-- =============================================

-- 1. Drop old role type and recreate with new values
-- NOTE: If app_role already exists, you need to add the new value
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'super_admin' AND enumtypid = 'public.app_role'::regtype) THEN
    ALTER TYPE public.app_role ADD VALUE 'super_admin';
  END IF;
END $$;

-- 2. Gym status enum
CREATE TYPE public.gym_status AS ENUM ('active', 'paused', 'suspended');

-- 3. User status enum
CREATE TYPE public.user_status AS ENUM ('active', 'paused', 'suspended');

-- 4. Gyms table (tenants)
CREATE TABLE public.gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  logo_url text,
  status gym_status NOT NULL DEFAULT 'active',
  max_coaches integer DEFAULT 10,
  max_clients integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;

-- 5. Add gym_id and status to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gym_id uuid REFERENCES public.gyms(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status user_status NOT NULL DEFAULT 'active';

-- Create index for tenant isolation queries
CREATE INDEX IF NOT EXISTS idx_profiles_gym_id ON public.profiles(gym_id);

-- 6. Security definer functions for multi-tenant checks

-- Check if user is super_admin (uses profiles.role)
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

-- Get user's gym_id
CREATE OR REPLACE FUNCTION public.get_user_gym_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gym_id FROM public.profiles WHERE id = _user_id
$$;

-- Check if user belongs to a specific gym
CREATE OR REPLACE FUNCTION public.belongs_to_gym(_user_id uuid, _gym_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND gym_id = _gym_id
  )
$$;

-- Check if gym is active
CREATE OR REPLACE FUNCTION public.is_gym_active(_gym_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.gyms
    WHERE id = _gym_id AND status = 'active'
  )
$$;

-- Get gym status
CREATE OR REPLACE FUNCTION public.get_gym_status(_gym_id uuid)
RETURNS gym_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.gyms WHERE id = _gym_id
$$;

-- 7. RLS Policies for gyms table

-- Super admins can do everything
CREATE POLICY "Super admins can manage all gyms"
  ON public.gyms FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Gym members can read their own gym
CREATE POLICY "Users can read own gym"
  ON public.gyms FOR SELECT
  TO authenticated
  USING (public.belongs_to_gym(auth.uid(), id));

-- 8. Update profiles RLS policies for multi-tenant

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Super admins can see all profiles
CREATE POLICY "Super admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Users can see profiles in their own gym
CREATE POLICY "Users can read gym profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    gym_id = public.get_user_gym_id(auth.uid())
    OR id = auth.uid()
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Super admins can update any profile
CREATE POLICY "Super admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- 9. (user_roles policies removed — profiles.role is the single source of truth)

-- 10. Update routines RLS for multi-tenant
DROP POLICY IF EXISTS "Coaches can manage own routines" ON public.routines;

CREATE POLICY "Coaches can manage own routines"
  ON public.routines FOR ALL
  TO authenticated
  USING (
    auth.uid() = coach_id
    AND public.is_gym_active(public.get_user_gym_id(auth.uid()))
  );

CREATE POLICY "Super admins can manage all routines"
  ON public.routines FOR ALL
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- 11. Update handle_new_user — uses profiles.role, no user_roles
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
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'client');
  _gym_id := (NEW.raw_user_meta_data->>'gym_id')::uuid;
  _gym_name := NEW.raw_user_meta_data->>'gym_name';

  IF _role = 'admin' AND _gym_name IS NOT NULL AND _gym_name != '' THEN
    INSERT INTO public.gyms (name, status)
    VALUES (_gym_name, 'active')
    RETURNING id INTO _gym_id;
  END IF;

  INSERT INTO public.profiles (id, full_name, avatar_url, gym_id, status, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    _gym_id,
    'active',
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

-- 12. Gym member counts view (uses profiles.role directly)
CREATE OR REPLACE VIEW public.gym_member_counts AS
SELECT
  g.id AS gym_id,
  g.name,
  g.status,
  g.created_at,
  COALESCE(coaches.count, 0) AS coach_count,
  COALESCE(clients.count, 0) AS client_count
FROM public.gyms g
LEFT JOIN (
  SELECT gym_id, COUNT(*) AS count
  FROM public.profiles
  WHERE role = 'coach'
  GROUP BY gym_id
) coaches ON coaches.gym_id = g.id
LEFT JOIN (
  SELECT gym_id, COUNT(*) AS count
  FROM public.profiles
  WHERE role = 'client'
  GROUP BY gym_id
) clients ON clients.gym_id = g.id;

-- =============================================
-- Done! Multi-tenant schema ready.
-- =============================================
