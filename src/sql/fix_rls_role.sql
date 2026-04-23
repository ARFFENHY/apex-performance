-- FIX: Sync Super Admin Role for arffenhybarazarte@gmail.com
-- Este script asegura que tu perfil en la base de datos tenga los permisos necesarios.

-- 1. Asegurar que el perfil existe con el rol correcto
INSERT INTO public.profiles (id, full_name, role, status, email)
VALUES ('c4e6e842-181b-4b66-a771-f22478793915', 'Usuario', 'super_admin', 'active', 'arffenhybarazarte@gmail.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  status = 'active',
  updated_at = NOW();

-- 2. (Opcional) Verificar que el bucket de storage permite la gestión
-- Generalmente esto se maneja por las políticas de storage.objects que ya configuramos antes,
-- pero asegurar el rol es el paso #1 para que la tabla exercise_images te deje insertar.

-- 3. Confirmación
SELECT id, email, role, status FROM public.profiles WHERE id = 'c4e6e842-181b-4b66-a771-f22478793915';
