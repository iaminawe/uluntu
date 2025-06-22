import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define basic types for our data
interface EventData {
  id: string;
  title?: string;
  date?: string;
  [key: string]: string | number | boolean | null | undefined; // More specific than 'any'
}

interface MemberData {
  id: string;
  first_name?: string;
  last_name?: string;
  [key: string]: string | number | boolean | null | undefined; // More specific than 'any'
}

interface CompanyData {
  id: string;
  name?: string;
  [key: string]: string | number | boolean | null | undefined; // More specific than 'any'
}

interface TestResult {
  table: string;
  success: boolean;
  count: number | null;
  error: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[] | null; // Using any here to accommodate JSON types
  fields: string[] | null;
}

interface ConfigInfo {
  url: string;
  hasAnonKey: boolean;
  keyLength: number;
}

interface AuthStatus {
  isAuthenticated: boolean;
  userId?: string;
  error: string | null;
}

// Simple component to test direct Supabase connection
const SupabaseTest: React.FC = () => {
  const [eventsData, setEventsData] = useState<EventData[]>([]);
  const [membersData, setMembersData] = useState<MemberData[]>([]);
  const [companiesData, setCompaniesData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<ConfigInfo | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('SupabaseTest: Starting direct Supabase queries');
        
        // Log Supabase configuration
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
        const useSupabase = import.meta.env.VITE_USE_SUPABASE;
        
        console.log('Supabase Config:', { 
          supabaseUrl, 
          hasAnonKey: !!supabaseAnonKey, 
          useSupabase,
          env: import.meta.env.MODE
        });
        
        // Set config info
        setConfig({
          url: supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          keyLength: supabaseAnonKey.length
        });
        
        // Create client instance for anonymous auth testing
        if (supabaseUrl && supabaseAnonKey) {
          const client = createClient(supabaseUrl, supabaseAnonKey);
          setSupabaseClient(client);
        }
        
        // Check auth status
        const { data: authData, error: authError } = await supabase.auth.getSession();
        setAuthStatus({
          isAuthenticated: !!authData?.session,
          userId: authData?.session?.user?.id,
          error: authError?.message || null
        });
        
        // Test tables
        const tables = ['events', 'members', 'companies', 'groups', 'news'] as const;
        type TableName = typeof tables[number];
        const testResults: TestResult[] = [];
        
        // Type assertion helper for strongly-typed table access
        const fromTable = <T extends TableName>(tableName: T) => {
          return supabase.from(tableName);
        };
        
        for (const table of tables) {
          try {
            console.log(`[SupabaseTest] Testing table: ${table}`);
            // Using our helper function for type-safe table access
            const { data, error, count } = await fromTable(table)
              .select('*', { count: 'exact' })
              .limit(5);
            
            const fields = data && data.length > 0 ? Object.keys(data[0]) : null;
            
            console.log(`[SupabaseTest] ${table} result:`, { 
              success: !error, 
              count, 
              hasData: !!data?.length,
              fields 
            });
            
            testResults.push({
              table,
              success: !error,
              count: count || null,
              error: error?.message || null,
              data: data || null,
              fields
            });
            
            // Store specific data for display
            if (table === 'events' && data) {
              // Type assertion with unknown as intermediate step
              setEventsData(data as unknown as EventData[]);
            } else if (table === 'members' && data) {
              // Type assertion with unknown as intermediate step
              setMembersData(data as unknown as MemberData[]);
            } else if (table === 'companies' && data) {
              // Type assertion with unknown as intermediate step
              setCompaniesData(data as unknown as CompanyData[]);
            }
            
          } catch (err) {
            console.error(`[SupabaseTest] Error testing ${table}:`, err);
            testResults.push({
              table,
              success: false,
              count: null,
              error: err instanceof Error ? err.message : 'Unknown error',
              data: null,
              fields: null
            });
          }
        }
        
        setResults(testResults);
      } catch (err) {
        console.error('[SupabaseTest] Global error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const runAnonymousAuth = async () => {
    if (!supabaseClient) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabaseClient.auth.signInAnonymously();
      
      if (error) {
        console.error('[SupabaseTest] Anonymous auth error:', error);
        setAuthStatus(prev => ({ ...prev!, error: error.message }));
      } else {
        console.log('[SupabaseTest] Anonymous auth success:', data);
        setAuthStatus({
          isAuthenticated: true,
          userId: data.user?.id,
          error: null
        });
      }
    } catch (err) {
      console.error('[SupabaseTest] Anonymous auth exception:', err);
      setAuthStatus(prev => ({ 
        ...prev!, 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-xl font-bold mb-3 text-blue-800">Supabase Direct Test</h3>
      
      {loading && (
        <div className="p-2 bg-blue-50 text-blue-700 rounded mb-3">
          Testing Supabase connection...
        </div>
      )}
      
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded mb-3">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {config && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">Configuration</h4>
          <p><strong>URL:</strong> {config.url}</p>
          <p><strong>Anon Key:</strong> {config.hasAnonKey ? `Present (${config.keyLength} chars)` : 'Missing'}</p>
        </div>
      )}
      
      {authStatus && (
        <div className={`mb-4 p-3 rounded ${authStatus.isAuthenticated ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <h4 className="font-semibold mb-2">Authentication Status</h4>
          <p><strong>Status:</strong> {authStatus.isAuthenticated ? 'Authenticated' : 'Not authenticated'}</p>
          {authStatus.userId && <p><strong>User ID:</strong> {authStatus.userId}</p>}
          {authStatus.error && <p className="text-red-600"><strong>Error:</strong> {authStatus.error}</p>}
          
          {!authStatus.isAuthenticated && (
            <button 
              onClick={runAnonymousAuth}
              disabled={loading}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Try Anonymous Auth
            </button>
          )}
        </div>
      )}
      
      {results.length > 0 && (
        <div>
          <h4 className="font-semibold mb-2">Table Access Tests</h4>
          {results.map((result) => (
            <div key={result.table} className={`mb-3 p-3 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <h5 className="font-medium text-lg">{result.table}</h5>
              <p><strong>Status:</strong> {result.success ? '✅ Success' : '❌ Failed'}</p>
              {result.count !== null && <p><strong>Records:</strong> {result.count}</p>}
              {result.fields && <p><strong>Fields:</strong> {result.fields.join(', ')}</p>}
              {result.error && <p className="text-red-600"><strong>Error:</strong> {result.error}</p>}
              
              {result.data && result.data.length > 0 && (
                <details>
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800 mt-2">
                    View Sample Data ({result.data.length} items)
                  </summary>
                  <pre className="text-xs mt-2 p-2 bg-gray-100 overflow-auto max-h-60 rounded">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Data Preview</h4>
        
        {/* Events */}
        <div className="mb-4">
          <h5 className="font-medium">Events ({eventsData.length})</h5>
          {eventsData.length > 0 ? (
            <ul className="list-disc list-inside">
              {eventsData.slice(0, 3).map(event => (
                <li key={event.id}>{event.title || 'Untitled Event'} ({event.date || 'No date'})</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No events data available</p>
          )}
        </div>
        
        {/* Members */}
        <div className="mb-4">
          <h5 className="font-medium">Members ({membersData.length})</h5>
          {membersData.length > 0 ? (
            <ul className="list-disc list-inside">
              {membersData.slice(0, 3).map(member => (
                <li key={member.id}>{member.first_name || ''} {member.last_name || ''}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No members data available</p>
          )}
        </div>
        
        {/* Companies */}
        <div className="mb-4">
          <h5 className="font-medium">Companies ({companiesData.length})</h5>
          {companiesData.length > 0 ? (
            <ul className="list-disc list-inside">
              {companiesData.slice(0, 3).map(company => (
                <li key={company.id}>{company.name || 'Unnamed Company'}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No companies data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupabaseTest;
