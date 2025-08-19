import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { menuManagementAdapter } from '@/features/admin/api/menuManagementAdapter';

export default function MenuManagementDebug() {
  const [debug, setDebug] = useState<any>({
    loading: true,
    containers: null,
    items: null,
    apiItems: null,
    error: null,
    userId: null,
    roles: null
  });

  useEffect(() => {
    async function fetchDebugInfo() {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Get user roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user?.id);

        // Get menu containers
        const { data: containers } = await supabase
          .from('menu_containers')
          .select('*');

        // Get menu items directly
        const { data: items } = await supabase
          .from('menu_items')
          .select('*');

        // Get menu items through API
        let apiItems = null;
        try {
          apiItems = await menuManagementAdapter.getAll();
        } catch (apiError) {
          console.error('API Error:', apiError);
        }

        setDebug({
          loading: false,
          userId: user?.id,
          roles,
          containers,
          items,
          apiItems,
          error: null
        });
      } catch (error) {
        setDebug({
          loading: false,
          error: error,
          containers: null,
          items: null,
          apiItems: null,
          userId: null,
          roles: null
        });
      }
    }

    fetchDebugInfo();
  }, []);

  if (debug.loading) {
    return <div className="p-8">Loading debug info...</div>;
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Menu Management Debug</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">User Info:</h2>
        <pre className="text-xs">{JSON.stringify({ userId: debug.userId, roles: debug.roles }, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Menu Containers ({debug.containers?.length || 0}):</h2>
        <pre className="text-xs">{JSON.stringify(debug.containers, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Menu Items (Direct from DB: {debug.items?.length || 0}):</h2>
        <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(debug.items, null, 2)}</pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Menu Items (Through API: {debug.apiItems?.length || 0}):</h2>
        <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(debug.apiItems, null, 2)}</pre>
      </div>

      {debug.error && (
        <div className="bg-red-100 dark:bg-red-900 p-4 rounded">
          <h2 className="font-bold mb-2 text-red-800 dark:text-red-200">Error:</h2>
          <pre className="text-xs text-red-700 dark:text-red-300">{JSON.stringify(debug.error, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}