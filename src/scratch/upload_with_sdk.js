
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbxjyxovbcprhatsbvkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGp5eG92YmNwcmhhdHNidmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDE4MTUsImV4cCI6MjA4OTAxNzgxNX0.r1b6irirRMTi5tmFltDo6qE_Z5sw2ul9s1d1FRae2RU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const commands = JSON.parse(fs.readFileSync('src/scratch/import_commands.json', 'utf8'));

async function uploadImages() {
  console.log(`Iniciando subida de ${commands.length} imágenes via SDK...`);
  
  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];
    process.stdout.write(`[${i+1}/${commands.length}] Subiendo: ${cmd.exerciseName}... `);
    
    try {
      if (!fs.existsSync(cmd.localPath)) {
        console.log(`❌ No encontrado (${cmd.localPath})`);
        continue;
      }
      const fileBuffer = fs.readFileSync(cmd.localPath);
      const { error } = await supabase.storage
        .from('photos')
        .upload(cmd.remotePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });
        
      if (error) {
        console.log(`❌ ${error.message}`);
      } else {
        console.log(`✅`);
      }
    } catch (e) {
      console.log(`❌ ${e.message}`);
    }
  }
}

uploadImages().then(() => console.log("¡Todo listo!"));
