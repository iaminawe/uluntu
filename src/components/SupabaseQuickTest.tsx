import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const SupabaseQuickTest: React.FC = () => {
  const [results, setResults] = useState<{
    events: { count: number | null; error: string | null };
    news: { count: number | null; error: string | null };
    companies: { count: number | null; error: string | null };
  }>({
    events: { count: null, error: null },
    news: { count: null, error: null },
    companies: { count: null, error: null }
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function testTables() {
      try {
        // Test events table
        const eventsResult = await supabase
          .from('events')
          .select('count', { count: 'exact', head: true });
          
        // Test news table
        const newsResult = await supabase
          .from('news')
          .select('count', { count: 'exact', head: true });
          
        // Test companies table
        const companiesResult = await supabase
          .from('companies')
          .select('count', { count: 'exact', head: true });
        
        setResults({
          events: { 
            count: eventsResult.count, 
            error: eventsResult.error ? eventsResult.error.message : null 
          },
          news: { 
            count: newsResult.count, 
            error: newsResult.error ? newsResult.error.message : null 
          },
          companies: { 
            count: companiesResult.count, 
            error: companiesResult.error ? companiesResult.error.message : null 
          }
        });
      } catch (err) {
        console.error('Test error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    testTables();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Supabase Table Test</h2>
      
      {loading ? (
        <p>Testing tables...</p>
      ) : (
        <div className="space-y-4">
          <div className={`p-3 rounded ${results.events.error ? 'bg-red-100' : 'bg-green-100'}`}>
            <h3 className="font-medium">Events Table</h3>
            {results.events.error ? (
              <p className="text-red-600">{results.events.error}</p>
            ) : (
              <p>Records: {results.events.count !== null ? results.events.count : 'Unknown'}</p>
            )}
          </div>
          
          <div className={`p-3 rounded ${results.news.error ? 'bg-red-100' : 'bg-green-100'}`}>
            <h3 className="font-medium">News Table</h3>
            {results.news.error ? (
              <p className="text-red-600">{results.news.error}</p>
            ) : (
              <p>Records: {results.news.count !== null ? results.news.count : 'Unknown'}</p>
            )}
          </div>
          
          <div className={`p-3 rounded ${results.companies.error ? 'bg-red-100' : 'bg-green-100'}`}>
            <h3 className="font-medium">Companies Table</h3>
            {results.companies.error ? (
              <p className="text-red-600">{results.companies.error}</p>
            ) : (
              <p>Records: {results.companies.count !== null ? results.companies.count : 'Unknown'}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupabaseQuickTest;
