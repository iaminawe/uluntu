// Simple standalone script to test Supabase connection
import { createClient } from '@supabase/supabase-js';

// Get environment variables directly
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== SUPABASE CONNECTION TEST ===');
console.log('Configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  anonKeyLength: supabaseAnonKey?.length
});

// Create a direct client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing connection...');
    
    // Test basic connection
    const { data: healthCheck, error: healthError } = await supabase.from('events').select('count', { count: 'exact' });
    console.log('Health check:', { data: healthCheck, error: healthError });
    
    // Check tables
    const tables = ['events', 'members', 'companies', 'groups', 'news_articles'];
    
    for (const table of tables) {
      console.log(`Testing table: ${table}`);
      const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(1);
      
      console.log(`${table} result:`, {
        success: !error,
        count,
        hasData: data && data.length > 0,
        error: error?.message,
        sample: data?.[0] ? Object.keys(data[0]) : 'No data'
      });
    }
    
    // Check RLS policies
    console.log('Checking if anonymous access is allowed...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth session:', {
      hasSession: !!authData?.session,
      error: authError?.message
    });
    
  } catch (err) {
    console.error('Test failed with error:', err);
  }
}

// Run the test
testConnection();

export {}; // Make this a module
