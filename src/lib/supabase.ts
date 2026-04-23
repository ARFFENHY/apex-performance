import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lbxjyxovbcprhatsbvkp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGp5eG92YmNwcmhhdHNidmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDE4MTUsImV4cCI6MjA4OTAxNzgxNX0.r1b6irirRMTi5tmFltDo6qE_Z5sw2ul9s1d1FRae2RU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
