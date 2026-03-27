const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    const { data, error } = await supabase.from('kv_store_0c0022a7').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Connection failed:', error.message);
    } else {
      console.log('Connection successful! Table exists.');
    }
  } catch (err) {
    console.error('Fetch failed with error:', err.message);
  }
}

test();
