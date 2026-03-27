import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllUserThemes() {
  console.log('Listing all user themes...');
  const { data, error } = await supabase
    .from('kv')
    .select('key, value')
    .like('key', 'user_theme:%');
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('User Themes:', JSON.stringify(data, null, 2));
}

listAllUserThemes();
