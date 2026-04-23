const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function link() {
  console.log('Scanning Storage...');
  const { data: files, error } = await supabase.storage.from('photos').list('exercises', { limit: 1000 });
  
  if (error) {
    console.error('Error listing storage:', error);
    return;
  }

  console.log(`Found ${files.length} files. Filtering by gender...`);

  const results = [];
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
    
    results.push({
      exercise_name: exerciseName,
      image_url: urlData.publicUrl,
      gender,
      position,
      source: 'bulk_link'
    });
  }

  console.log(`Ready to upsert ${results.length} connections.`);

  for (const res of results) {
    const { error: upsertError } = await supabase
      .from('exercise_images')
      .upsert(res, { onConflict: 'exercise_name,position,gender' });
    
    if (upsertError) {
      console.error(`Error linking ${res.exercise_name}:`, upsertError.message);
    }
  }

  console.log('Done.');
}

link();
