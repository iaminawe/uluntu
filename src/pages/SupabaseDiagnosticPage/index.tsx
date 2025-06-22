import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { debugSupabase, testAnonymousAuth, testTableAccess } from '../../utils/supabaseDebugger';
import { useAppDispatch } from '../../app/hooks';
import { fetchEvents } from '../../features/events/store/eventsSlice';
import { fetchMembers } from '../../features/directory/store/membersSlice';
import { fetchCompanies } from '../../features/companies/store/companiesSlice';
import { fetchGroups } from '../../features/groups/store/groupsSlice';
import { fetchNewsArticles } from '../../features/news/store/newsSlice';

interface DiagnosticState {
  isRunning: boolean;
  results: Record<string, unknown> | null;
  error: string | null;
  tableTests: Record<string, Record<string, unknown>>;
  reduxTests: Record<string, Record<string, unknown>>;
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
          [tableName]: { isRunning: false, result } as Record<string, unknown>
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
      let action;
      switch (sliceName) {
        case 'events':
          action = fetchEvents();
          break;
        case 'members':
          action = fetchMembers();
          break;
        case 'companies':
          action = fetchCompanies();
          break;
        case 'groups':
          action = fetchGroups();
          break;
        case 'news':
          action = fetchNewsArticles();
          break;
        default:
          throw new Error(`Unknown slice: ${sliceName}`);
      }
      
      const result = await dispatch(action).unwrap();
      setState(prev => ({ 
        ...prev, 
        reduxTests: { 
          ...prev.reduxTests, 
          [sliceName]: { 
            isRunning: false, 
            result,
            success: true,
            count: Array.isArray(result) ? result.length : 0
          } as Record<string, unknown>
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
          } as Record<string, unknown>
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
        <title>Supabase Diagnostics | Nelson Tech</title>
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
      {state.results && (
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
                {state.anonymousAuth.userId && (
                  <p><strong>User ID:</strong> {state.anonymousAuth.userId}</p>
                )}
                {state.anonymousAuth.error && (
                  <p className="text-red-600"><strong>Error:</strong> {state.anonymousAuth.error}</p>
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
            {state.results.tables.map((table: Record<string, unknown>) => (
              <div 
                key={table.table}
                className={`p-4 rounded ${table.success ? 'bg-green-50' : 'bg-red-50'}`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{table.table}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${table.success ? 'bg-green-200' : 'bg-red-200'}`}>
                    {table.success ? 'Success' : 'Failed'}
                  </span>
                </div>
                
                {table.count !== null && (
                  <p className="mt-2"><strong>Records:</strong> {table.count}</p>
                )}
                
                {table.fields && (
                  <p className="mt-1"><strong>Fields:</strong> {table.fields.slice(0, 5).join(', ')}{table.fields.length > 5 ? '...' : ''}</p>
                )}
                
                {table.error && (
                  <p className="text-red-600 mt-2">{table.error}</p>
                )}
                
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => testSpecificTable(table.table)}
                    disabled={state.tableTests[table.table]?.isRunning}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {state.tableTests[table.table]?.isRunning ? 'Testing...' : 'Test Access'}
                  </button>
                  <button
                    onClick={() => testReduxFetch(table.table)}
                    disabled={state.reduxTests[table.table]?.isRunning}
                    className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {state.reduxTests[table.table]?.isRunning ? 'Fetching...' : 'Test Redux Fetch'}
                  </button>
                </div>
                
                {state.tableTests[table.table]?.result && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <h4 className="font-medium">Access Test Results:</h4>
                    <div className="mt-2">
                      <p><strong>Normal Access:</strong> {state.tableTests[table.table].result.normalAccess?.success ? 'Success' : 'Failed'}</p>
                      {state.tableTests[table.table].result.normalAccess?.count !== null && (
                        <p><strong>Count:</strong> {state.tableTests[table.table].result.normalAccess.count}</p>
                      )}
                      {state.tableTests[table.table].result.normalAccess?.error && (
                        <p className="text-red-600">{state.tableTests[table.table].result.normalAccess.error}</p>
                      )}
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p><strong>Anonymous Access:</strong> {state.tableTests[table.table].result.anonymousAccess?.success ? 'Success' : 'Failed'}</p>
                      {state.tableTests[table.table].result.anonymousAccess?.count !== null && (
                        <p><strong>Count:</strong> {state.tableTests[table.table].result.anonymousAccess.count}</p>
                      )}
                      {state.tableTests[table.table].result.anonymousAccess?.error && (
                        <p className="text-red-600">{state.tableTests[table.table].result.anonymousAccess.error}</p>
                      )}
                    </div>
                  </div>
                )}
                
                {state.reduxTests[table.table]?.result && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <h4 className="font-medium">Redux Fetch Results:</h4>
                    <p>
                      <strong>Status:</strong> {
                        state.reduxTests[table.table].success 
                          ? '✅ Success' 
                          : '❌ Failed'
                      }
                    </p>
                    <p>
                      <strong>Items:</strong> {
                        state.reduxTests[table.table].count
                      }
                    </p>
                    {state.reduxTests[table.table].error && (
                      <p className="text-red-600">
                        {state.reduxTests[table.table].error}
                      </p>
                    )}
                  </div>
                )}
                
                {table.sample && (
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
          
          {state.results.rls.error ? (
            <div className="p-4 bg-yellow-50 rounded">
              <p>Unable to check RLS policies: {state.results.rls.error}</p>
              <p className="mt-2 text-sm">Note: Checking RLS policies typically requires admin privileges</p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded">
              <p><strong>RLS Enabled:</strong> {state.results.rls.enabled ? 'Yes' : 'No or Unknown'}</p>
              
              {state.results.rls.policies && state.results.rls.policies.length > 0 ? (
                <div className="mt-3">
                  <h4 className="font-medium">Policies:</h4>
                  <ul className="mt-2 list-disc list-inside">
                    {state.results.rls.policies.map((policy: Record<string, unknown>, index: number) => (
                      <li key={index}>
                        {policy.name}: {policy.definition}
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
