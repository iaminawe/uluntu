import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../api/supabaseUtils';

type ListingDebugData = {
  id: string;
  title?: string | null;
  description?: string | null;
  price?: number | null;
  images?: string[] | null;
  condition?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  location?: string | null;
  tags?: string[] | null;
  seller_id?: string | null;
  featured?: boolean | null;
  [key: string]: any;
};

/**
 * Debug component for MarketplaceDetailPage to diagnose why listings aren't loading
 */
export default function DetailDebug() {
  const { id } = useParams();
  const [data, setData] = useState<ListingDebugData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direct Supabase query for comparison - only run once
  useEffect(() => {
    let isMounted = true;
    
    async function queryDirectly() {
      if (!id) {
        if (isMounted) {
          setError('No ID parameter found');
          setIsLoading(false);
        }
        return;
      }

      try {
        console.log('DetailDebug: Querying directly with ID:', id);
        setIsLoading(true);
        
        // Query with joins
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', id)
          .single();

        if (isMounted) {
          if (error) {
            console.error('DetailDebug: Query error:', error);
            setError(error.message);
          } else {
            console.log('DetailDebug: Query result:', data);
            setData(data);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('DetailDebug: Exception in direct query:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setIsLoading(false);
        }
      }
    }

    queryDirectly();
    
    // Cleanup function to prevent state updates on unmounted component
    return () => {
      isMounted = false;
    };
  }, [id]); // Only re-run if ID changes

  return (
    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg mt-6">
      <h3 className="text-lg font-medium mb-4">Detail Debug Information</h3>
      
      <div className="space-y-4">
        <div>
          <p className="font-medium">Current ID Parameter:</p>
          <pre className="bg-slate-200 dark:bg-slate-700 p-2 rounded">{id || 'No ID found'}</pre>
        </div>

        <div>
          <p className="font-medium">Direct Database Query:</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          {error && (
            <div className="text-red-500">
              <p>Error: {error}</p>
            </div>
          )}
          <div>
            <p>Data: </p>
            <pre className="bg-slate-200 dark:bg-slate-700 p-2 rounded text-xs overflow-auto max-h-40">
              {data ? JSON.stringify(data, null, 2) : 'No data'}
            </pre>
          </div>
        </div>

        <p className="text-sm text-slate-500">
          Check the browser console for detailed query results
        </p>
      </div>
    </div>
  );
}
