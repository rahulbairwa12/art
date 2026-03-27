const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('Listing tables for project:', supabaseUrl);
  
  try {
    // Supabase doesn't have a direct "list tables" but we can query the internal schema if we have service role
    const { data, error } = await supabase.rpc('get_tables'); // Won't work without a custom RPC
    
    // Alternative: check information_schema via a raw query if enabled, 
    // but usually we just try a few common names or ask the user.
    // Let's try to query information_schema.tables directly via POSTGRES
    
    // For now, let's just try to check if common names exist
    const commonTables = ['themes', 'artifact_codes', 'user_progress', 'reflections', 'kv_store_0c0022a7'];
    console.log('Checking common tables...');
    
    for (const table of commonTables) {
      const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (!error) {
        console.log(` - Table '${table}' EXISTS!`);
      }
    }
  } catch (err) {
    console.error('List tables failed:', err.message);
  }
}

listTables();
