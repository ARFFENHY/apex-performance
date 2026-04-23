
const fs = require('fs');
const path = require('path');

// Configuración
const SOURCE_DIR = 'C:/Users/arffe/Desktop/ejercicios femeninos';
const GENDER = 'female';
const SUPABASE_URL = 'https://lbxjyxovbcprhatsbvkp.supabase.co';

// 1. Leer archivos
const files = fs.readdirSync(SOURCE_DIR);
console.log(`Encontrados ${files.length} archivos en el directorio.`);

// 2. Mapear nombres
const mappings = files.filter(f => f.toLowerCase().endsWith('.jpg') || f.toLowerCase().endsWith('.png')).map(file => {
  // Limpiar nombre: "Ejercicio - Nombre.jpg" -> "Nombre"
  let cleanName = file.replace(/^Ejercicio\s*-\s*/, '').replace(/\.(jpg|png)$/i, '');
  
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

  const storagePath = `exercises/${safeName}-${GENDER}-start.jpg`; // Forzamos .jpg para consistencia
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/photos/${storagePath}`;

  return {
    originalFile: file,
    exerciseName: cleanName,
    storagePath: storagePath,
    publicUrl: publicUrl
  };
});

// 3. Generar SQL
const sqlLines = [
  '-- IMPORT DATA (FEMALE BATCH)',
  '-- DELETE FROM public.exercise_images WHERE gender = \'female\'; -- Opcional: Limpiar antes'
];

mappings.forEach(m => {
  const line = `INSERT INTO public.exercise_images (exercise_name, image_url, position, gender, media_type, source) VALUES ('${m.exerciseName.replace(/'/g, "''")}', '${m.publicUrl}', 'start', '${GENDER}', 'image', 'manual') ON CONFLICT (exercise_name, position, gender) DO UPDATE SET image_url = EXCLUDED.image_url;`;
  sqlLines.push(line);
});

fs.writeFileSync('src/scratch/import_data_female.sql', sqlLines.join('\n'));
fs.writeFileSync('src/scratch/import_commands_female.json', JSON.stringify(mappings, null, 2));

console.log(`SQL generado en src/scratch/import_data_female.sql (${mappings.length} inserciones)`);
