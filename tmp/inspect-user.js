import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const userId = 'dev_ZGl2eWFuc2h1Lmt1bWF3';
  console.log('Inspecting User:', userId);
  
  const themeId = await getKv(`user_theme:${userId}`);
  console.log('User Theme ID:', themeId);
  
  if (themeId) {
    const themeData = await getKv(`theme:${themeId}`);
    console.log('Theme Data:', JSON.stringify(themeData, null, 2));
  }
}

async function getKv(key) {
  const { data, error } = await supabase
    .from('kv')
    .select('value')
    .eq('key', key)
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') return null;
    return null;
  }
  return data.value;
}

inspect();
