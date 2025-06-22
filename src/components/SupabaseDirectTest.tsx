import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

interface TableData {
  tableName: string;
  count: number | null;
  error: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[] | null;
}

const SupabaseDirectTest: React.FC = () => {
  const [results, setResults] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState<{url: string, hasKey: boolean}>({
    url: import.meta.env.VITE_SUPABASE_URL || 'Not set',
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
  });

  useEffect(() => {
    async function testSupabase() {
      setLoading(true);
      // Define tables with type safety
      const tables = ['events', 'news', 'companies', 'members', 'groups'] as const;
      type TableName = typeof tables[number];
      const results: TableData[] = [];

      for (const tableName of tables) {
        try {
          console.log(`[SupabaseDirectTest] Testing table: ${tableName}`);
          
          // First try a count query with type assertion
          const countResult = await supabase
            .from(tableName as keyof Database['public']['Tables'])
            .select('count', { count: 'exact', head: true });
            
          console.log(`[SupabaseDirectTest] ${tableName} count result:`, countResult);
          
          // Then try to get actual data with type assertion
          const { data, error } = await supabase
            .from(tableName as keyof Database['public']['Tables'])
            .select('*')
            .limit(5);
            
          console.log(`[SupabaseDirectTest] ${tableName} data result:`, { 
            dataLength: data?.length, 
            error,
            firstItem: data && data.length > 0 ? data[0] : null
          });
          
          results.push({
            tableName,
            count: countResult.count,
            error: error ? `${error.code}: ${error.message}` : null,
            data: data
          });
        } catch (err) {
          console.error(`[SupabaseDirectTest] Error testing ${tableName}:`, err);
          results.push({
            tableName,
            count: null,
            error: err instanceof Error ? err.message : 'Unknown error',
            data: null
          });
        }
      }
      
      setResults(results);
      setLoading(false);
    }
    
    testSupabase();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Direct Supabase Test</h2>
      
      <div className="mb-4 p-3 bg-gray-100 rounded">
        <h3 className="font-semibold">Connection Info</h3>
        <p><strong>URL:</strong> {connectionInfo.url}</p>
        <p><strong>Has Anon Key:</strong> {connectionInfo.hasKey ? 'Yes' : 'No'}</p>
      </div>
      
      {loading ? (
        <p>Testing Supabase connection...</p>
      ) : (
        <div>
          <h3 className="font-semibold mb-2">Table Results</h3>
          
          {results.map((result) => (
            <div key={result.tableName} className="mb-4 p-3 bg-gray-100 rounded">
              <h4 className="font-medium">{result.tableName}</h4>
              <p><strong>Count:</strong> {result.count !== null ? result.count : 'Error'}</p>
              {result.error && (
                <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
              )}
              
              {result.data && result.data.length > 0 ? (
                <div>
                  <p><strong>Data:</strong> {result.data.length} items</p>
                  <details>
                    <summary className="cursor-pointer text-blue-600">View Data</summary>
                    <pre className="mt-2 p-2 bg-gray-200 overflow-auto max-h-40 text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupabaseDirectTest;
