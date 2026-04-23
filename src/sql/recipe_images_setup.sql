-- Crear Tabla de Imágenes de Recetas para el Catálogo
CREATE TABLE IF NOT EXISTS public.recipe_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(recipe_name)
);

-- Habilitar RLS
ALTER TABLE public.recipe_images ENABLE ROW LEVEL SECURITY;

-- Políticas de Acceso
-- 1. Todos pueden ver las imágenes
CREATE POLICY "Recipe images are viewable by everyone" 
ON public.recipe_images FOR SELECT 
USING (true);

-- 2. Solo administradores pueden subir/borrar
CREATE POLICY "Only admins can manage recipe images" 
ON public.recipe_images FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.role = 'admin' OR profiles.role = 'super_admin')
    )
);

-- Notificar recarga de esquema
NOTIFY pgrst, 'reload schema';
