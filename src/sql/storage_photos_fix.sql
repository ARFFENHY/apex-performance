-- FIX: Configuración de Acceso Público para el Bucket 'photos'
-- Ejecuta esto en el Editor SQL de Supabase para arreglar las imágenes rotas

-- 1. Asegurar que el bucket existe y es público
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Eliminar políticas antiguas si existen (para evitar conflictos)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Manage" ON storage.objects;

-- 3. Crear Política: Cualquiera puede ver las fotos (Lectura Pública)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'photos');

-- 4. Crear Política: El sistema (service_role) puede subir fotos
-- Esto es lo que usan las Edge Functions
CREATE POLICY "Service Role Manage"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'photos')
WITH CHECK (bucket_id = 'photos');
