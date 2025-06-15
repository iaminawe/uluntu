// Check the schema of the companies table
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opkqtpmmtvprhfyjmkhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkSchema() {
  console.log('Checking companies table schema...\n');

  // Get one row to see the columns
  const { data: sample, error } = await supabase
    .from('companies')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else if (sample && sample.length > 0) {
    console.log('Companies table columns:');
    console.log(Object.keys(sample[0]));
    console.log('\nSample data:');
    console.log(sample[0]);
  } else {
    console.log('No data found, attempting to insert a test row to discover schema...');
    
    // Try a minimal insert to see what columns are required
    const { error: insertError } = await supabase
      .from('companies')
      .insert({
        name: 'Test Company',
        description: 'Test description',
        status: 'published'
      });
    
    if (insertError) {
      console.log('Insert error (this helps identify required columns):');
      console.log(insertError);
    }
  }
}

checkSchema().catch(console.error);