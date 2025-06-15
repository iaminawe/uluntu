// Check the schema of the groups table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opkqtpmmtvprhfyjmkhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Checking groups table schema...\n');

  // Try to insert a minimal group to see what columns exist
  const { error: insertError } = await supabase
    .from('groups')
    .insert({
      name: 'Test Group Check Schema',
      description: 'Test description',
      status: 'draft'
    });
  
  if (insertError) {
    console.log('Insert error details (this helps identify schema):');
    console.log(insertError);
    
    // Try to get table info through a different approach
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .limit(0);
    
    if (!error && data) {
      console.log('\nDetected columns from empty select:');
      // Even with no rows, we can sometimes get column info
    }
  }
  
  // Try another approach - get actual column names
  console.log('\nAttempting to query information_schema...');
  const { data: cols, error: colError } = await supabase.rpc('get_table_columns', {
    table_name: 'groups',
    schema_name: 'public'
  }).catch(() => null);
  
  if (cols) {
    console.log('Groups table columns:', cols);
  }
}

// Create a function to get columns if it doesn't exist
const createColumnFunction = `
CREATE OR REPLACE FUNCTION get_table_columns(table_name text, schema_name text DEFAULT 'public')
RETURNS TABLE(column_name text, data_type text, is_nullable text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    column_name::text,
    data_type::text,
    is_nullable::text
  FROM information_schema.columns
  WHERE table_schema = schema_name
  AND table_name = $1
  ORDER BY ordinal_position;
$$;
`;

checkSchema().catch(console.error);