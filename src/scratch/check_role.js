
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbxjyxovbcprhatsbvkp.supabase.co';
const supabaseKey = 'YOUR_ANON_KEY'; // I need to get this from src/lib/supabase.ts

async function checkUser() {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('No user logged in or session invalid in this environment');
    return;
  }
  console.log('User ID:', user.id);
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching profile:', error.message);
  } else {
    console.log('Profile:', profile);
  }
}

checkUser();
