import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function DebugInfo() {
  const { id } = useParams<{ id: string }>();
  const [debugInfo, setDebugInfo] = useState<any>({});
  
  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        if (!id) return;
        
        // Test 1: Direct group fetch
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .single();
          
        // Test 2: Check if groups table has any data
        const { count, error: countError } = await supabase
          .from('groups')
          .select('*', { count: 'exact', head: true });
          
        setDebugInfo({
          groupId: id,
          groupData,
          groupError,
          totalGroups: count,
          countError,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setDebugInfo({
          groupId: id,
          catchError: error,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    fetchDebugInfo();
  }, [id]);
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: 'white',
      border: '2px solid red',
      padding: '10px',
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <h3>Debug Info</h3>
      <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
    </div>
  );
}