import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ContentContainer } from '@/shared/components/ui/PageLayout';

interface TableResult {
  count: number | null;
  error: string | null;
  sample: any[] | null;
}

const QuickDiagnosticPage: React.FC = () => {
  const [results, setResults] = useState<Record<string, TableResult>>({});
  const [loading, setLoading] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState({
    url: import.meta.env.VITE_SUPABASE_URL || 'Not set',
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    useSupabase: import.meta.env.VITE_USE_SUPABASE === 'true'
  });

  useEffect(() => {
    async function testTables() {
      const tables = ['events', 'news', 'companies', 'members', 'groups'];
      const results: Record<string, TableResult> = {};

      for (const table of tables) {
        try {
          console.log(`Testing table: ${table}`);
          
          // Get count
          const countResult = await supabase
            .from(table as any)
            .select('count', { count: 'exact', head: true });
          
          // Get sample data
          const dataResult = await supabase
            .from(table as any)
            .select('*')
            .limit(3);
          
          results[table] = {
            count: countResult.count,
            error: countResult.error ? countResult.error.message : null,
            sample: dataResult.data
          };
          
          console.log(`${table} result:`, results[table]);
        } catch (err) {
          console.error(`Error testing ${table}:`, err);
          results[table] = {
            count: null,
            error: err instanceof Error ? err.message : 'Unknown error',
            sample: null
          };
        }
      }
      
      setResults(results);
      setLoading(false);
    }
    
    testTables();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="py-8">
        <ContentContainer>
          <div className="mb-6">
            <Link to="/" className="text-blue-600 hover:text-blue-800 underline">
              Back to Home
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold mb-6">Quick Supabase Diagnostic</h1>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <p><strong>VITE_SUPABASE_URL:</strong> {connectionInfo.url}</p>
              <p><strong>VITE_SUPABASE_ANON_KEY:</strong> {connectionInfo.hasKey ? 'Present' : 'Missing'}</p>
              <p><strong>VITE_USE_SUPABASE:</strong> {connectionInfo.useSupabase ? 'true' : 'false'}</p>
              <p><strong>NODE_ENV:</strong> {import.meta.env.MODE}</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Table Tests</h2>
            
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <span className="ml-3">Testing tables...</span>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(results).map(([table, result]) => (
                  <div key={table} className={`p-4 rounded-lg ${result.error ? 'bg-red-50' : 'bg-green-50'}`}>
                    <h3 className="text-lg font-semibold mb-2">{table}</h3>
                    
                    {result.error ? (
                      <div className="text-red-600 mb-2">
                        <strong>Error:</strong> {result.error}
                      </div>
                    ) : (
                      <div className="mb-2">
                        <strong>Count:</strong> {result.count !== null ? result.count : 'Unknown'}
                      </div>
                    )}
                    
                    {result.sample && result.sample.length > 0 ? (
                      <div>
                        <h4 className="font-medium mb-1">Sample Data:</h4>
                        <pre className="bg-slate-100 p-3 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.sample, null, 2)}
                        </pre>
                      </div>
                    ) : !result.error && (
                      <div className="text-amber-600">No data available in this table</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ContentContainer>
      </div>
    </div>
  );
};

export default QuickDiagnosticPage;
