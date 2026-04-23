-- FIX SCHEMA: Agregar columnas faltantes a exercise_images
-- Este script agrega las columnas que el frontend espera pero que faltan en la tabla.

-- 1. Agregar columnas
ALTER TABLE public.exercise_images 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image',
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- 2. Recargar el caché del esquema para que la API las vea
NOTIFY pgrst, 'reload schema';

-- 3. Verificación
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exercise_images';
