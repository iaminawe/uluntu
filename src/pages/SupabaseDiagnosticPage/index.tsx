import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { debugSupabase, testAnonymousAuth, testTableAccess, DebugResult } from '../../utils/supabaseDebugger';
import { useAppDispatch } from '../../app/hooks';
// Redux slices imports removed - no longer needed for diagnostic
// Server data is now handled by React Query, Redux only manages UI state

interface DiagnosticConnectionResult {
  success: boolean;
  error?: string;
  url: string;
  hasAnonKey: boolean;
}

interface DiagnosticAuthResult {
  success: boolean;
  error?: string;
  session?: unknown;
  user?: unknown;
  isAuthenticated?: boolean;
  userId?: string;
}

interface DiagnosticResults {
  connection: DiagnosticConnectionResult;
  auth: DiagnosticAuthResult;
  [key: string]: unknown;
}

interface TestResult {
  isRunning: boolean;
  result?: unknown;
  error?: string;
  success?: boolean;
  message?: string;
}

interface DiagnosticState {
  isRunning: boolean;
  results: DebugResult | null;
  error: string | null;
  tableTests: Record<string, TestResult>;
  reduxTests: Record<string, TestResult>;
  anonymousAuth?: Record<string, unknown> | null;
}

const SupabaseDiagnosticPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [state, setState] = useState<DiagnosticState>({
    isRunning: false,
    results: null,
    error: null,
    tableTests: {},
    reduxTests: {}
  });

  const runDiagnostics = async () => {
    setState(prev => ({ ...prev, isRunning: true, error: null }));
    
    try {
      // Run comprehensive diagnostics
      const results = await debugSupabase();
      setState(prev => ({ ...prev, results }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Unknown error running diagnostics' 
      }));
    } finally {
      setState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const testSpecificTable = async (tableName: string) => {
    setState(prev => ({ 
      ...prev, 
      tableTests: { 
        ...prev.tableTests, 
        [tableName]: { isRunning: true } 
      } 
    }));
    
    try {
      const result = await testTableAccess(tableName);
      setState(prev => ({ 
        ...prev, 
        tableTests: { 
          ...prev.tableTests, 
          [tableName]: { isRunning: false, result }
        } 
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        tableTests: { 
          ...prev.tableTests, 
          [tableName]: { 
            isRunning: false, 
            error: err instanceof Error ? err.message : 'Unknown error' 
          } 
        } 
      }));
    }
  };

  const testReduxFetch = async (sliceName: string) => {
    setState(prev => ({ 
      ...prev, 
      reduxTests: { 
        ...prev.reduxTests, 
        [sliceName]: { isRunning: true } 
      } 
    }));
    
    try {
      // Note: Redux fetch actions have been removed as part of the hybrid pattern migration
      // Server data is now managed by React Query, Redux only handles UI state
      
      setState(prev => ({ 
        ...prev, 
        reduxTests: { 
          ...prev.reduxTests, 
          [sliceName]: { 
            isRunning: false, 
            success: true,
            message: `Redux UI slice for ${sliceName} exists (server data now handled by React Query)`
          } 
        } 
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        reduxTests: { 
          ...prev.reduxTests, 
          [sliceName]: { 
            isRunning: false, 
            error: err instanceof Error ? err.message : 'Unknown error',
            success: false
          }
        } 
      }));
    }
  };

  const runAnonymousAuth = async () => {
    setState(prev => ({ ...prev, isRunning: true, error: null }));
    
    try {
      const result = await testAnonymousAuth();
      setState(prev => ({ 
        ...prev, 
        anonymousAuth: result 
      }));
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Unknown error running anonymous auth' 
      }));
    } finally {
      setState(prev => ({ ...prev, isRunning: false }));
    }
  };

  useEffect(() => {
    // Auto-run diagnostics on mount
    runDiagnostics();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Supabase Diagnostics | Uluntu</title>
      </Helmet>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-800">Supabase Diagnostics</h1>
        <div>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-200 rounded mr-2 hover:bg-gray-300"
          >
            Back to Home
          </button>
          <button 
            onClick={runDiagnostics}
            disabled={state.isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {state.isRunning ? 'Running...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>
      
      {state.error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {state.error}
        </div>
      )}
      
      {/* Environment Variables */}
      <div className="mb-8 p-4 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded">
            <p><strong>VITE_SUPABASE_URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not set'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p>
              <strong>VITE_SUPABASE_ANON_KEY:</strong> {
                import.meta.env.VITE_SUPABASE_ANON_KEY 
                  ? `Present (${import.meta.env.VITE_SUPABASE_ANON_KEY.length} chars)` 
                  : 'Not set'
              }
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p><strong>VITE_USE_SUPABASE:</strong> {import.meta.env.VITE_USE_SUPABASE || 'Not set'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p><strong>NODE_ENV:</strong> {import.meta.env.MODE || 'Not available'}</p>
          </div>
        </div>
      </div>
      
      {/* Connection Status */}
      {state.results && (
        <div className="mb-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className={`p-4 rounded ${state.results.connection.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-lg font-medium">
              {state.results.connection.success ? '✅ Connected' : '❌ Connection Failed'}
            </p>
            {state.results.connection.error && (
              <p className="text-red-600 mt-2">{state.results.connection.error}</p>
            )}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>URL:</strong> {state.results.connection.url}</p>
                <p><strong>Anon Key:</strong> {state.results.connection.hasAnonKey ? 'Present' : 'Missing'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Authentication Status */}
      {state.results && (state.results as any).auth && (
        <div className="mb-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <div className={`p-4 rounded ${state.results.auth.isAuthenticated ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <p className="text-lg font-medium">
              {state.results.auth.isAuthenticated ? '✅ Authenticated' : '⚠️ Not Authenticated'}
            </p>
            {state.results.auth.userId && (
              <p className="mt-2"><strong>User ID:</strong> {state.results.auth.userId}</p>
            )}
            {state.results.auth.error && (
              <p className="text-red-600 mt-2">{state.results.auth.error}</p>
            )}
            
            {!state.results.auth.isAuthenticated && (
              <button 
                onClick={runAnonymousAuth}
                disabled={state.isRunning}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Try Anonymous Auth
              </button>
            )}
            
            {state.anonymousAuth && (
              <div className="mt-3 p-3 bg-gray-50 rounded">
                <h4 className="font-medium">Anonymous Auth Result:</h4>
                <p><strong>Success:</strong> {state.anonymousAuth.success ? 'Yes' : 'No'}</p>
                {(state.anonymousAuth as any).userId && (
                  <p><strong>User ID:</strong> {String((state.anonymousAuth as any).userId)}</p>
                )}
                {(state.anonymousAuth as any).error && (
                  <p className="text-red-600"><strong>Error:</strong> {String((state.anonymousAuth as any).error)}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Table Access */}
      {state.results && (
        <div className="mb-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Table Access</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(state.results.tables as any[]).map((table: Record<string, unknown>, index: number) => (
              <div 
                key={table.table as string || index}
                className={`p-4 rounded ${table.success ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{String(table.table)}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${table.success ? 'bg-green-200' : 'bg-red-200'}`}>
                    {table.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                
                {table.count !== null && (
                  <p className="mt-2"><strong>Records:</strong> {String(table.count)}</p>
                )}
                
                {table.fields && (
                  <p className="mt-1"><strong>Fields:</strong> {(table.fields as any)?.slice(0, 5)?.join(', ')}{(table.fields as any)?.length > 5 ? '...' : ''}</p>
                )}
                
                {(table as any).error && (
                  <p className="text-red-600 mt-2">{String((table as any).error)}</p>
                )}
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => testSpecificTable((table as any).table)}
                    disabled={state.tableTests[(table as any).table]?.isRunning}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {state.tableTests[(table as any).table]?.isRunning ? 'Testing...' : 'Test Access'}
                  </button>
                  <button
                    onClick={() => testReduxFetch((table as any).table)}
                    disabled={state.reduxTests[(table as any).table]?.isRunning}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {state.reduxTests[(table as any).table]?.isRunning ? 'Fetching...' : 'Test Redux Fetch'}
                  </button>
                </div>
                
                {state.tableTests[(table as any).table]?.result && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <h4 className="font-medium">Access Test Results:</h4>
                    <div className="mt-2">
                      <p><strong>Normal Access:</strong> {(state.tableTests[(table as any).table].result as any).normalAccess?.success ? 'Success' : 'Failed'}</p>
                      {(state.tableTests[(table as any).table].result as any).normalAccess?.count !== null && (
                        <p><strong>Count:</strong> {(state.tableTests[(table as any).table].result as any).normalAccess.count}</p>
                      )}
                      {(state.tableTests[(table as any).table].result as any).normalAccess?.error && (
                        <p className="text-red-600">{(state.tableTests[(table as any).table].result as any).normalAccess.error}</p>
                      )}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>Anonymous Access:</strong> {(state.tableTests[(table as any).table].result as any).anonymousAccess?.success ? 'Success' : 'Failed'}</p>
                      {(state.tableTests[(table as any).table].result as any).anonymousAccess?.count !== null && (
                        <p><strong>Count:</strong> {(state.tableTests[(table as any).table].result as any).anonymousAccess.count}</p>
                      )}
                      {(state.tableTests[(table as any).table].result as any).anonymousAccess?.error && (
                        <p className="text-red-600">{(state.tableTests[(table as any).table].result as any).anonymousAccess.error}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {state.reduxTests[(table as any).table]?.result && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <h4 className="font-medium">Redux Fetch Results:</h4>
                    <p>
                      <strong>Status:</strong> {
                        (state.reduxTests[(table as any).table] as any).success 
                          ? '✅ Success' 
                          : '❌ Failed'
                      }
                    </p>
                    <p>
                      <strong>Items:</strong> {
                        (state.reduxTests[(table as any).table] as any).count
                      }
                    </p>
                    {(state.reduxTests[(table as any).table] as any).error && (
                      <p className="text-red-600">
                        {(state.reduxTests[(table as any).table] as any).error}
                      </p>
                    )}
                  </div>
                )}
                
                {(table.sample as any) && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      View Sample Data
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto max-h-40 rounded">
                      {JSON.stringify(table.sample, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* RLS Policies */}
      {state.results && state.results.rls && (
        <div className="mb-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Row Level Security</h2>
          
          {(state.results.rls as any).error ? (
            <div className="p-4 bg-yellow-50 rounded">
              <p>Unable to check RLS policies: {(state.results.rls as any).error}</p>
              <p className="mt-2 text-sm">Note: Checking RLS policies typically requires admin privileges</p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded">
              <p><strong>RLS Enabled:</strong> {(state.results.rls as any).enabled ? 'Yes' : 'No or Unknown'}</p>
              
              {(state.results.rls as any).policies && (state.results.rls as any).policies.length > 0 ? (
                <div className="mt-3">
                  <h4 className="font-medium">Policies:</h4>
                  <ul className="mt-2 list-disc list-inside">
                    {(state.results.rls as any).policies.map((policy: Record<string, unknown>, index: number) => (
                      <li key={index}>
                        {String(policy.name)}: {String(policy.definition)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="mt-2">No policies found or unable to retrieve policies.</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Raw Results */}
      {state.results && (
        <div className="mb-8 p-4 bg-white rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Raw Diagnostic Results</h2>
          <details>
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              View Raw JSON Results
            </summary>
            <pre className="mt-3 p-4 bg-gray-100 overflow-auto max-h-96 rounded text-xs">
              {JSON.stringify(state.results, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default SupabaseDiagnosticPage;
