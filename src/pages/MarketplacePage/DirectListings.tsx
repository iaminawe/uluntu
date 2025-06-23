import { useState, useEffect } from 'react';
import { supabase } from '../../api/supabaseUtils';

// Simple, direct component that queries the database without any complex logic
const DirectListings = () => {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDirectFromSupabase() {
      try {
        console.log('DirectListings: Querying marketplace_listings table directly...');
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .limit(10);
        
        if (error) {
          console.error('DirectListings: Database query error:', error);
          setError(`Error: ${error.message}`);
        } else {
          console.log('DirectListings: Got data directly from Supabase:', data);
          setListings(data || []);
        }
      } catch (err) {
        console.error('DirectListings: Unexpected error:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchDirectFromSupabase();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading direct marketplace listings...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error</h3>
        <p>{error?.message || String(error)}</p>
      </div>
    );
  }

  if (!listings.length) {
    return (
      <div className="p-4 text-center">
        <p>No marketplace listings found in the database.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Direct Marketplace Listings</h2>
      <p className="mb-4 text-sm text-slate-500">Showing {listings.length} listings directly from the database</p>
      
      <div className="overflow-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b dark:border-slate-700">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Title</th>
              <th className="py-2 px-4 text-left">Type</th>
              <th className="py-2 px-4 text-left">Price</th>
              <th className="py-2 px-4 text-left">Created</th>
            </tr>
          </thead>
          <tbody>
            {listings.map(listing => (
              <tr key={listing.id} className="border-b dark:border-slate-700">
                <td className="py-2 px-4">{listing.id}</td>
                <td className="py-2 px-4">{listing.title}</td>
                <td className="py-2 px-4">{listing.type}</td>
                <td className="py-2 px-4">{typeof listing.price === 'number' ? `$${listing.price}` : 'N/A'}</td>
                <td className="py-2 px-4">{new Date(listing.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Raw data display for debugging */}
      <details className="mt-6 border-t dark:border-slate-700 pt-4">
        <summary className="cursor-pointer text-sm font-medium">View Raw Data</summary>
        <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded text-xs overflow-auto max-h-80">
          {JSON.stringify(listings, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default DirectListings;
