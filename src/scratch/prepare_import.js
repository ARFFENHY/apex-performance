
import fs from 'fs';
import path from 'path';

const sourceDir = 'C:\\Users\\arffe\\Desktop\\ejercicios';
if (!fs.existsSync(sourceDir)) {
    console.error("Directory not found:", sourceDir);
    process.exit(1);
}

const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.jpg'));

function normalize(s) {
  return s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// Minimal catalog for regeneration based on common knowledge of the project
const catalogEntries = [
    { name: "Ab wheel rollout" },
    { name: "Aperturas con mancuernas plano" },
    { name: "Aperturas declinadas con mancuernas" },
    { name: "Aperturas en polea" },
    { name: "Aperturas inclinadas con mancuernas" },
    { name: "Cruce de poleas alto" },
    { name: "Cruce de poleas bajo" },
    { name: "Curl alterno con mancuernas" },
    { name: "Curl con barra EZ" },
    { name: "Curl con barra Z" },
    { name: "Curl con cable a una mano" },
    { name: "Curl con mancuernas alterno" },
    { name: "Curl concentrado" },
    { name: "Curl en polea baja" },
    { name: "Curl martillo" },
    { name: "Curl spider con barra" },
    { name: "Dominadas asistidas" },
    { name: "Dominadas con lastre" },
    { name: "Dominadas explosivas" },
    { name: "Dominadas negativas" },
    { name: "Dominadas tipo archer" },
    { name: "Elevaciones frontales alternas" },
    { name: "Elevaciones frontales con disco" },
    { name: "Elevaciones frontales con barra" },
    { name: "Elevaciones laterales con banda" },
    { name: "Elevaciones laterales inclinadas" },
    { name: "Elevaciones laterales en polea" },
    { name: "Elevaciones YTWL" },
    { name: "Encogimientos con barra" },
    { name: "Encogimientos con mancuernas" },
    { name: "Encogimientos de hombros" },
    { name: "Face pull" },
    { name: "Face pull con cuerda" },
    { name: "Flexiones a una mano" },
    { name: "Flexiones con agarre cerrado" },
    { name: "Flexiones con banda" },
    { name: "Flexiones con palmada" },
    { name: "Flexiones explosivas" },
    { name: "Flexiones tipo archer" },
    { name: "Flexiones de pecho" },
    { name: "Handstand push-up" },
    { name: "Hiperextensiones" },
    { name: "Mountain climbers" },
    { name: "Peso muerto a una pierna" },
    { name: "Peso muerto rumano con barra" },
    { name: "Peso muerto sumo" },
    { name: "Pike push-up" },
    { name: "Press Arnold" },
    { name: "Press con kettlebell" },
    { name: "Press de banca con mancuernas" },
    { name: "Press de pecho con agarre neutro" },
    { name: "Press de pecho con pausa" },
    { name: "Press declinado con mancuernas" },
    { name: "Press inclinado con mancuernas" },
    { name: "Press militar con barra de pie" },
    { name: "Press militar con mancuernas" },
    { name: "Press militar de pie" },
    { name: "Press militar sentado con barra" },
    { name: "Pull-over con barra" },
    { name: "Pullover con mancuerna" },
    { name: "Pullover en polea alta" },
    { name: "Push press" },
    { name: "Remo al cuello con barra" },
    { name: "Remo alto con barra" },
    { name: "Remo con barra T agarre estrecho" },
    { name: "Remo con barra agarre prono" },
    { name: "Remo con mancuerna en banco" },
    { name: "Remo en polea baja" },
    { name: "Remo en TRX" },
    { name: "Remo invertido (australian pull-up)" },
    { name: "Remo pendlay" },
    { name: "Rotaciones externas con banda" },
    { name: "Russian twist" },
    { name: "Sentadilla hack" }
];

const commands = [];

files.forEach(file => {
  const cleanFileName = normalize(file.replace("Ejercicio - ", "").replace(".jpg", ""));
  
  let match = null;
  let maxScore = 0;
  
  catalogEntries.forEach(ex => {
    const cleanExName = normalize(ex.name);
    if (cleanFileName === cleanExName) {
      match = ex.name;
      maxScore = 100;
    } else if (cleanExName.includes(cleanFileName) || cleanFileName.includes(cleanExName)) {
      const score = Math.min(cleanFileName.length, cleanExName.length) / Math.max(cleanFileName.length, cleanExName.length) * 100;
      if (score > maxScore) {
        maxScore = score;
        match = ex.name;
      }
    }
  });

  if (match && maxScore > 40) {
    const safeName = match.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const remotePath = `exercises/${safeName}.jpg`;
    const localPath = path.join(sourceDir, file);
    
    commands.push({
      localPath,
      remotePath,
      exerciseName: match,
      imageUrl: `https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/${remotePath}`
    });
  }
});

fs.writeFileSync('src/scratch/import_commands.json', JSON.stringify(commands, null, 2));

let sql = `BEGIN;\n`;
commands.forEach(cmd => {
  sql += `INSERT INTO public.exercise_images (exercise_name, image_url, position, gender) 
VALUES ('${cmd.exerciseName.replace(/'/g, "''")}', '${cmd.imageUrl}', 'start', 'male')
ON CONFLICT (exercise_name, position, gender) 
DO UPDATE SET image_url = EXCLUDED.image_url;\n`;
});
sql += `COMMIT;`;

fs.writeFileSync('src/scratch/import_data.sql', sql);

console.log(`Regenerated ${commands.length} commands.`);
