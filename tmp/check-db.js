const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking database for project:', supabaseUrl);
  
  try {
    const { data, error } = await supabase
      .from('kv_store_0c0022a7')
      .select('key');
      
    if (error) {
      console.error('Error fetching data:', error.message);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log('Database is empty.');
    } else {
      console.log('Found keys in database:');
      data.forEach(item => console.log(' -', item.key));
    }
  } catch (err) {
    console.error('Diagnostic failed:', err.message);
  }
}

checkData();
