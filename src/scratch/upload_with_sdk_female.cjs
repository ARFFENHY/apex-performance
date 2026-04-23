
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'C:/Users/arffe/Desktop/ejercicios femeninos';
const JSON_FILE = 'src/scratch/import_commands_female.json';
const SUPABASE_URL = 'https://lbxjyxovbcprhatsbvkp.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGp5eG92YmNwcmhhdHNidmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDE4MTUsImV4cCI6MjA4OTAxNzgxNX0.r1b6irirRMTi5tmFltDo6qE_Z5sw2ul9s1d1FRae2RU';

const supabase = createClient(SUPABASE_URL, ANON_KEY);

async function uploadBatch() {
  const commands = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8'));
  console.log(`Subiendo ${commands.length} archivos...`);

  for (const cmd of commands) {
    const localPath = path.join(SOURCE_DIR, cmd.originalFile);
    if (!fs.existsSync(localPath)) {
      console.warn(`Archivo no encontrado: ${localPath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(localPath);
    const { error } = await supabase.storage
      .from('photos')
      .upload(cmd.storagePath, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error(`Error subiendo ${cmd.originalFile}:`, error.message);
    } else {
      console.log(`✅ ${cmd.originalFile} -> ${cmd.storagePath}`);
    }
  }
}

uploadBatch();
