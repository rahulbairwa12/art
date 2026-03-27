
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function dumpThemes() {
  try {
    const { data, error } = await supabase
      .from("kv_store_0c0022a7")
      .select("key, value")
      .like("key", "theme:%");
    
    if (error) throw error;
    
    console.log(JSON.stringify(data.map(d => ({ key: d.key, value: d.value })), null, 2));
  } catch (error) {
    console.error(error);
  }
}

dumpThemes();
