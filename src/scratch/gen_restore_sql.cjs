
const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://lbxjyxovbcprhatsbvkp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGp5eG92YmNwcmhhdHNidmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDE4MTUsImV4cCI6MjA4OTAxNzgxNX0.r1b6irirRMTi5tmFltDo6qE_Z5sw2ul9s1d1FRae2RU');

async function r() {
  const { data: files } = await s.storage.from('photos').list('exercises', { limit: 1000 });
  if (!files) return;

  let sql = 'INSERT INTO public.exercise_images (exercise_name, image_url, gender, position, source) VALUES\n';
  const values = [];

  for (const file of files) {
    const name = file.name;
    let exName = '';
    let gender = 'male';
    let pos = 'start';

    if (name.includes('-female-')) {
      gender = 'female';
      exName = name.split('-female-')[0].replace(/-/g, ' ');
    } else if (name.includes('-male-')) {
      gender = 'male';
      exName = name.split('-male-')[0].replace(/-/g, ' ');
    } else {
      exName = name.split('.')[0].replace(/-/g, ' ');
    }

    if (name.includes('-end-')) pos = 'end';

    const url = 'https://lbxjyxovbcprhatsbvkp.supabase.co/storage/v1/object/public/photos/exercises/' + name;
    values.push(`('${exName.replace(/'/g, "''")}', '${url}', '${gender}', '${pos}', 'bulk_restore')`);
  }

  process.stdout.write(sql + values.join(',\n') + '\nON CONFLICT (exercise_name, position, gender) DO UPDATE SET image_url = EXCLUDED.image_url;');
}

r();
