
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, count, error } = await supabase
    .from('exercise_images')
    .select('gender', { count: 'exact' });
  
  if (error) {
    console.error(error);
    return;
  }
  
  const stats = data.reduce((acc, curr) => {
    acc[curr.gender] = (acc[curr.gender] || 0) + 1;
    return acc;
  }, {});
  
  console.log('Stats:', stats);
  console.log('Total:', count);
}

check();
