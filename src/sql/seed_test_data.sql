-- =============================================
-- SEED: 5 Gyms, 5 Coaches, 5 Clients
-- Asignación aleatoria gym → coaches/clientes
-- Ejecutar en Supabase SQL Editor
-- =============================================

-- 1. Crear 5 gimnasios
INSERT INTO public.gyms (id, name, slug, status) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Iron Temple', 'iron-temple', 'active'),
  ('a1000000-0000-0000-0000-000000000002', 'FitZone Pro', 'fitzone-pro', 'active'),
  ('a1000000-0000-0000-0000-000000000003', 'PowerHouse Gym', 'powerhouse-gym', 'active'),
  ('a1000000-0000-0000-0000-000000000004', 'Elite Fitness', 'elite-fitness', 'active'),
  ('a1000000-0000-0000-0000-000000000005', 'Titan Academy', 'titan-academy', 'active')
ON CONFLICT DO NOTHING;

-- 2. Crear 5 coaches en auth.users + profiles
-- Password: Test1234! (bcrypt hash)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'coach1@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Carlos Martínez","role":"coach"}', 'authenticated', 'authenticated', now(), now()),
  ('c1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'coach2@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Ana López","role":"coach"}', 'authenticated', 'authenticated', now(), now()),
  ('c1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'coach3@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Miguel Torres","role":"coach"}', 'authenticated', 'authenticated', now(), now()),
  ('c1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'coach4@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Laura García","role":"coach"}', 'authenticated', 'authenticated', now(), now()),
  ('c1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'coach5@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Diego Ramírez","role":"coach"}', 'authenticated', 'authenticated', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create identities for coaches (required for Supabase auth to work)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', jsonb_build_object('sub', 'c1000000-0000-0000-0000-000000000001', 'email', 'coach1@test.com'), 'email', 'c1000000-0000-0000-0000-000000000001', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', jsonb_build_object('sub', 'c1000000-0000-0000-0000-000000000002', 'email', 'coach2@test.com'), 'email', 'c1000000-0000-0000-0000-000000000002', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', jsonb_build_object('sub', 'c1000000-0000-0000-0000-000000000003', 'email', 'coach3@test.com'), 'email', 'c1000000-0000-0000-0000-000000000003', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', jsonb_build_object('sub', 'c1000000-0000-0000-0000-000000000004', 'email', 'coach4@test.com'), 'email', 'c1000000-0000-0000-0000-000000000004', now(), now(), now()),
  ('c1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', jsonb_build_object('sub', 'c1000000-0000-0000-0000-000000000005', 'email', 'coach5@test.com'), 'email', 'c1000000-0000-0000-0000-000000000005', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Profiles for coaches (assigned to random gyms)
INSERT INTO public.profiles (id, full_name, role, gym_id, status) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Carlos Martínez', 'coach', 'a1000000-0000-0000-0000-000000000001', 'active'),
  ('c1000000-0000-0000-0000-000000000002', 'Ana López', 'coach', 'a1000000-0000-0000-0000-000000000003', 'active'),
  ('c1000000-0000-0000-0000-000000000003', 'Miguel Torres', 'coach', 'a1000000-0000-0000-0000-000000000002', 'active'),
  ('c1000000-0000-0000-0000-000000000004', 'Laura García', 'coach', 'a1000000-0000-0000-0000-000000000005', 'active'),
  ('c1000000-0000-0000-0000-000000000005', 'Diego Ramírez', 'coach', 'a1000000-0000-0000-0000-000000000004', 'active')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  gym_id = EXCLUDED.gym_id,
  status = EXCLUDED.status;

-- 3. Crear 5 clientes en auth.users + profiles
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, aud, role, created_at, updated_at)
VALUES
  ('d1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'client1@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Pedro Sánchez","role":"client"}', 'authenticated', 'authenticated', now(), now()),
  ('d1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'client2@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"María Fernández","role":"client"}', 'authenticated', 'authenticated', now(), now()),
  ('d1000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'client3@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Juan Herrera","role":"client"}', 'authenticated', 'authenticated', now(), now()),
  ('d1000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'client4@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Sofía Morales","role":"client"}', 'authenticated', 'authenticated', now(), now()),
  ('d1000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'client5@test.com', crypt('Test1234!', gen_salt('bf')), now(), '{"full_name":"Roberto Díaz","role":"client"}', 'authenticated', 'authenticated', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Create identities for clients
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', jsonb_build_object('sub', 'd1000000-0000-0000-0000-000000000001', 'email', 'client1@test.com'), 'email', 'd1000000-0000-0000-0000-000000000001', now(), now(), now()),
  ('d1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', jsonb_build_object('sub', 'd1000000-0000-0000-0000-000000000002', 'email', 'client2@test.com'), 'email', 'd1000000-0000-0000-0000-000000000002', now(), now(), now()),
  ('d1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', jsonb_build_object('sub', 'd1000000-0000-0000-0000-000000000003', 'email', 'client3@test.com'), 'email', 'd1000000-0000-0000-0000-000000000003', now(), now(), now()),
  ('d1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004', jsonb_build_object('sub', 'd1000000-0000-0000-0000-000000000004', 'email', 'client4@test.com'), 'email', 'd1000000-0000-0000-0000-000000000004', now(), now(), now()),
  ('d1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005', jsonb_build_object('sub', 'd1000000-0000-0000-0000-000000000005', 'email', 'client5@test.com'), 'email', 'd1000000-0000-0000-0000-000000000005', now(), now(), now())
ON CONFLICT DO NOTHING;

-- Profiles for clients (assigned to same gyms as coaches for linkage)
INSERT INTO public.profiles (id, full_name, role, gym_id, status) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Pedro Sánchez', 'client', 'a1000000-0000-0000-0000-000000000001', 'active'),
  ('d1000000-0000-0000-0000-000000000002', 'María Fernández', 'client', 'a1000000-0000-0000-0000-000000000003', 'active'),
  ('d1000000-0000-0000-0000-000000000003', 'Juan Herrera', 'client', 'a1000000-0000-0000-0000-000000000002', 'active'),
  ('d1000000-0000-0000-0000-000000000004', 'Sofía Morales', 'client', 'a1000000-0000-0000-0000-000000000005', 'active'),
  ('d1000000-0000-0000-0000-000000000005', 'Roberto Díaz', 'client', 'a1000000-0000-0000-0000-000000000004', 'active')
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  gym_id = EXCLUDED.gym_id,
  status = EXCLUDED.status;

-- 4. Asignar clientes a coaches (mismo gym = relación válida)
INSERT INTO public.coach_clients (coach_id, client_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001'), -- Carlos → Pedro (Iron Temple)
  ('c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002'), -- Ana → María (PowerHouse)
  ('c1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003'), -- Miguel → Juan (FitZone)
  ('c1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000004'), -- Laura → Sofía (Titan)
  ('c1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000005')  -- Diego → Roberto (Elite)
ON CONFLICT DO NOTHING;

-- =============================================
-- RESUMEN DE DATOS CREADOS:
-- =============================================
-- 5 Gyms: Iron Temple, FitZone Pro, PowerHouse Gym, Elite Fitness, Titan Academy
-- 5 Coaches: coach1@test.com → coach5@test.com (Password: Test1234!)
-- 5 Clients: client1@test.com → client5@test.com (Password: Test1234!)
-- Cada coach tiene 1 cliente asignado en el mismo gym
--
-- LOGINS DE PRUEBA:
-- coach1@test.com / Test1234! → Carlos Martínez (Iron Temple)
-- client1@test.com / Test1234! → Pedro Sánchez (Iron Temple)
-- =============================================
