-- FIX COMPLETO: Permisos de Administrador para Imágenes y Storage
-- Ejecuta este script en el Editor SQL de Supabase para arreglar definitivamente los permisos de subida.

-- 1. Sincronizar tu rol de Super Admin (por si acaso)
INSERT INTO public.profiles (id, role, status, email)
VALUES ('c4e6e842-181b-4b66-a771-f22478793915', 'super_admin', 'active', 'arffenhybarazarte@gmail.com')
ON CONFLICT (id) DO UPDATE SET
  role = 'super_admin',
  status = 'active',
  updated_at = NOW();

-- 2. Habilitar permisos de STORAGE para el bucket 'photos'
-- Esto permite que los administradores suban archivos directamente desde la app.

DROP POLICY IF EXISTS "Admins can manage photos" ON storage.objects;
CREATE POLICY "Admins can manage photos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
)
WITH CHECK (
  bucket_id = 'photos' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

-- 3. Asegurar permisos en la tabla de base de datos
DROP POLICY IF EXISTS "Manage Exercise Images" ON public.exercise_images;
CREATE POLICY "Manage Exercise Images"
ON public.exercise_images FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  )
);

-- 4. Verificación
SELECT 'Permisos actualizados correctamente' as resultado;
