
const fs = require('fs');
const path = require('path');

// Configuración
const SOURCE_DIR = 'C:/Users/arffe/Desktop/recetas';
const SUPABASE_URL = 'https://lbxjyxovbcprhatsbvkp.supabase.co';

// 1. Leer archivos
const files = fs.readdirSync(SOURCE_DIR);
console.log(`Encontrados ${files.length} archivos en el directorio de recetas.`);

// 2. Mapear nombres
const mappings = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png')).map(file => {
  // Limpiar nombre: "Receta - Nombre.jpg" -> "Nombre"
  let cleanName = file.replace(/^Receta\s*-\s*/i, '').replace(/\.(jpg|png)$/i, '');
  
  // Limpiar sufijos comunes
  cleanName = cleanName.replace(/\(\d+\)$/, '').trim();

  // Generar path seguro para storage
  const safeName = cleanName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const storagePath = `recipes/${safeName}.jpg`; // Almacenamos en subcarpeta recipes
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/photos/${storagePath}`;

  return {
    originalFile: file,
    recipeName: cleanName,
    storagePath: storagePath,
    publicUrl: publicUrl
  };
});

// 3. Generar SQL
const sqlLines = [
  '-- IMPORT RECIPE IMAGES',
  '-- DELETE FROM public.recipe_images; -- Opcional: Limpiar antes'
];

mappings.forEach(m => {
  const line = `INSERT INTO public.recipe_images (recipe_name, image_url) VALUES ('${m.recipeName.replace(/'/g, "''")}', '${m.publicUrl}') ON CONFLICT (recipe_name) DO UPDATE SET image_url = EXCLUDED.image_url;`;
  sqlLines.push(line);
});

fs.writeFileSync('src/scratch/import_data_recipes.sql', sqlLines.join('\n'));
fs.writeFileSync('src/scratch/import_commands_recipes.json', JSON.stringify(mappings, null, 2));

console.log(`SQL generado en src/scratch/import_data_recipes.sql (${mappings.length} inserciones)`);
