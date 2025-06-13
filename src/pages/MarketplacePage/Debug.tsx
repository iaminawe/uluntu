import { useState, useEffect } from 'react';
import { marketplaceApi } from '../../api/marketplaceApi';
import { supabase } from '../../api/supabaseUtils';

export default function MarketplaceDebug() {
  const [directItems, setDirectItems] = useState<any[]>([]);
  const [apiItems, setApiItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Direct Supabase query
        console.log('Starting direct query to marketplace_listings table...');
        const { data: directData, error: directError } = await supabase
          .from('marketplace_listings')
          .select('*')
          .limit(10);
        
        if (directError) {
          console.error('Direct query error:', directError);
          setError(`Direct query error: ${directError.message}`);
        } else {
          console.log('Direct query result:', directData);
          setDirectItems(directData || []);
        }

        // API query
        console.log('Starting API query via marketplaceApi.getAll()...');
        const apiData = await marketplaceApi.getAll();
        console.log('API query result:', apiData);
        setApiItems(apiData || []);
      } catch (err) {
        console.error('Debug fetch error:', err);
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Marketplace Debug</h2>
      
      {loading ? (
        <div className="text-center py-4">Loading data...</div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded mb-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Direct Query Results ({directItems.length} items)</h3>
            {directItems.length === 0 ? (
              <p>No items found in database table</p>
            ) : (
              <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(directItems, null, 2)}
              </pre>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">API Query Results ({apiItems.length} items)</h3>
            {apiItems.length === 0 ? (
              <p>No items returned from API</p>
            ) : (
              <pre className="bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-auto max-h-60">
                {JSON.stringify(apiItems, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
