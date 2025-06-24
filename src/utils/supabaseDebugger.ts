import { createClient } from '@supabase/supabase-js';

interface TableTestResult {
  table: string;
  success: boolean;
  count: number | null;
  error: string | null;
  fields: string[] | null;
  sample?: Record<string, unknown> | null;
}

export interface DebugResult {
  connection: {
    url: string;
    hasAnonKey: boolean;
    keyLength: number;
    success: boolean;
    error?: string;
  };
  auth: {
    isAuthenticated: boolean;
    userId?: string | null;
    error?: string | null;
  };
  tables: TableTestResult[];
  rls: {
    enabled: boolean | null;
    policies: Record<string, unknown>[] | null;
    error?: string;
  };
}

/**
 * Comprehensive Supabase debugging utility that tests connection,
 * authentication, table access, and RLS policies
 */
export async function debugSupabase(): Promise<DebugResult> {
  const result: DebugResult = {
    connection: {
      url: '',
      hasAnonKey: false,
      keyLength: 0,
      success: false
    },
    auth: {
      isAuthenticated: false
    },
    tables: [],
    rls: {
      enabled: null,
      policies: null
    }
  };

  try {
    console.log('[SupabaseDebugger] Starting comprehensive Supabase diagnostics');
    
    // Check environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    result.connection.url = supabaseUrl;
    result.connection.hasAnonKey = !!supabaseAnonKey;
    result.connection.keyLength = supabaseAnonKey.length;
    
    // Create client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test basic connection
    const { error: connectionError } = await supabase
      .from('events')
      .select('count', { count: 'exact', head: true });
    
    result.connection.success = !connectionError;
    if (connectionError) {
      result.connection.error = connectionError.message;
      console.error('[SupabaseDebugger] Connection error:', connectionError);
    } else {
      console.log('[SupabaseDebugger] Connection successful');
    }
    
    // Check auth status
    const { data: authData, error: authError } = await supabase.auth.getSession();
    result.auth = {
      isAuthenticated: !!authData?.session,
      userId: authData?.session?.user?.id,
      error: authError?.message
    };
    
    console.log('[SupabaseDebugger] Auth status:', result.auth);
    
    // Test tables
    const tables = ['events', 'members', 'companies', 'groups', 'news'];
    
    for (const table of tables) {
      try {
        console.log(`[SupabaseDebugger] Testing table: ${table}`);
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        const fields = data && data.length > 0 ? Object.keys(data[0]) : null;
        
        const tableResult: TableTestResult = {
          table,
          success: !error,
          count,
          error: error?.message || null,
          fields,
          sample: data && data.length > 0 ? data[0] : null
        };
        
        result.tables.push(tableResult);
        
        console.log(`[SupabaseDebugger] ${table} result:`, { 
          success: !error, 
          count, 
          hasData: !!data?.length,
          fields: fields?.length
        });
        
        if (error) {
          console.error(`[SupabaseDebugger] Error accessing ${table}:`, error);
        }
      } catch (err) {
        console.error(`[SupabaseDebugger] Exception testing ${table}:`, err);
        result.tables.push({
          table,
          success: false,
          count: null,
          error: err instanceof Error ? err.message : 'Unknown error',
          fields: null
        });
      }
    }
    
    // Try to check RLS status (requires admin privileges, may fail with anon key)
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .rpc('get_policies', { table_name: 'events' });
      
      if (rlsError) {
        result.rls.error = rlsError.message;
        console.log('[SupabaseDebugger] Unable to check RLS policies (requires admin privileges)');
      } else {
        result.rls.policies = rlsData;
        result.rls.enabled = rlsData && rlsData.length > 0;
        console.log('[SupabaseDebugger] RLS policies:', rlsData);
      }
    } catch (err) {
      result.rls.error = err instanceof Error ? err.message : 'Unknown error checking RLS';
      console.error('[SupabaseDebugger] Error checking RLS:', err);
    }
    
  } catch (err) {
    console.error('[SupabaseDebugger] Global error:', err);
    if (err instanceof Error) {
      result.connection.error = err.message;
    }
  }
  
  console.log('[SupabaseDebugger] Complete diagnostic result:', result);
  return result;
}

/**
 * Attempts to sign in anonymously to test if anonymous auth is enabled
 */
export async function testAnonymousAuth() {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Missing Supabase environment variables' };
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('[SupabaseDebugger] Anonymous auth error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('[SupabaseDebugger] Anonymous auth success:', data);
    return { 
      success: true, 
      userId: data.user?.id,
      session: data.session
    };
  } catch (err) {
    console.error('[SupabaseDebugger] Anonymous auth exception:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Tests if a specific table has public read access
 */
export async function testTableAccess(tableName: string) {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { success: false, error: 'Missing Supabase environment variables' };
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // First try with current auth state
    const { data: normalData, error: normalError, count: normalCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1);
    
    // Then try with anonymous auth
    const { success: anonAuthSuccess } = await testAnonymousAuth();
    
    // Try again after anonymous auth
    const { data: anonData, error: anonError, count: anonCount } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(1);
    
    return {
      normalAccess: {
        success: !normalError,
        count: normalCount,
        error: normalError?.message,
        hasData: !!normalData?.length
      },
      anonymousAccess: {
        authSuccess: anonAuthSuccess,
        success: !anonError,
        count: anonCount,
        error: anonError?.message,
        hasData: !!anonData?.length
      }
    };
  } catch (err) {
    console.error(`[SupabaseDebugger] Error testing ${tableName} access:`, err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}
