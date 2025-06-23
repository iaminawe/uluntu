import { supabase } from '@/lib/supabase';

/**
 * Utility function to check Supabase connection and table data
 * This can be imported and called from any component or run directly
 */
export async function checkSupabaseConnection() {
  console.log('=== SUPABASE CONNECTION CHECK ===');
  
  // Log environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const hasAnonKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  const useSupabase = import.meta.env.VITE_USE_SUPABASE;
  
  console.log('Environment:', {
    supabaseUrl,
    hasAnonKey,
    useSupabase,
    mode: import.meta.env.MODE
  });
  
  try {
    // Check auth status
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Auth session:', {
      hasSession: !!authData?.session,
      error: authError?.message
    });
    
    // Check tables
    const tables = ['events', 'members', 'companies', 'groups', 'news'] as const;
    type TableName = typeof tables[number];
    const results: Record<string, Record<string, unknown>> = {};
    
    for (const table of tables) {
      console.log(`Checking table: ${table}`);
      
      try {
        // First check if we can access the table
        const { data, error, count } = await supabase
          .from(table as TableName)
          .select('*', { count: 'exact' })
          .limit(5);
        
        results[table] = {
          accessible: !error,
          count,
          hasData: data && data.length > 0,
          error: error?.message,
          sample: data && data.length > 0 ? data[0] : null
        };
        
        console.log(`${table} check:`, results[table]);
      } catch (tableError) {
        console.error(`Error checking ${table}:`, tableError);
        results[table] = { 
          accessible: false, 
          error: tableError instanceof Error ? tableError.message : 'Unknown error' 
        };
      }
    }
    
    return {
      success: true,
      tables: results
    };
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// This allows the function to be called directly from the browser console
(window as any).checkSupabase = checkSupabaseConnection;
