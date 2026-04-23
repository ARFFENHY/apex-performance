-- CONFIGURACIÓN DE TABLAS PARA IMÁGENES DE IA
-- Ejecutar después de crear el bucket 'photos' manualmente

-- 1. Tabla de Imágenes de Ejercicios
CREATE TABLE IF NOT EXISTS public.exercise_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    position TEXT NOT NULL CHECK (position IN ('start', 'end')),
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    media_type TEXT DEFAULT 'image',
    source TEXT DEFAULT 'manual',
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(exercise_name, position, gender)
);

-- 2. Tabla de Imágenes de Recetas
CREATE TABLE IF NOT EXISTS public.recipe_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipe_name)
);

-- 3. Habilitar RLS
ALTER TABLE public.exercise_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_images ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acceso (Lectura pública, Gestión para Admins)
-- Ejercicios
DROP POLICY IF EXISTS "View Exercise Images" ON public.exercise_images;
CREATE POLICY "View Exercise Images" ON public.exercise_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage Exercise Images" ON public.exercise_images;
CREATE POLICY "Manage Exercise Images" ON public.exercise_images FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')));

-- Recetas
DROP POLICY IF EXISTS "View Recipe Images" ON public.recipe_images;
CREATE POLICY "View Recipe Images" ON public.recipe_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Manage Recipe Images" ON public.recipe_images;
CREATE POLICY "Manage Recipe Images" ON public.recipe_images FOR ALL TO authenticated 
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')));

-- Notificar
NOTIFY pgrst, 'reload schema';
