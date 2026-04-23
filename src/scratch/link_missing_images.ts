
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual env parsing since dotenv might be missing
function getEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split('\n');
  const env: any = {};
  lines.forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) env[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  });
  return env;
}

const env = getEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function link() {
  console.log('Scanning Storage...');
  const { data: files, error } = await supabase.storage.from('photos').list('exercises', { limit: 1000 });
  
  if (error) {
    console.error('Error listing storage:', error);
    return;
  }

  console.log(`Found ${files?.length || 0} files. Filtering and linking...`);
  if (!files) return;

  for (const file of files) {
    const name = file.name;
    let exerciseName = '';
    let gender = 'male';
    let position = 'start';

    if (name.includes('-female-')) {
      gender = 'female';
      exerciseName = name.split('-female-')[0].replace(/-/g, ' ');
    } else if (name.includes('-male-')) {
      gender = 'male';
      exerciseName = name.split('-male-')[0].replace(/-/g, ' ');
    } else {
      exerciseName = name.split('.')[0].replace(/-/g, ' ');
    }

    if (name.includes('-end-')) position = 'end';

    const { data: urlData } = supabase.storage.from('photos').getPublicUrl(`exercises/${name}`);
    
    const record = {
      exercise_name: exerciseName,
      image_url: urlData.publicUrl,
      gender,
      position,
      source: 'bulk_link_v2'
    };

    const { error: upsertError } = await supabase
      .from('exercise_images')
      .upsert(record, { onConflict: 'exercise_name,position,gender' });
    
    if (upsertError) {
      console.error(`Error linking ${exerciseName}:`, upsertError.message);
    } else {
      console.log(`Linked: ${exerciseName} (${gender})`);
    }
  }

  console.log('Done.');
}

link();
