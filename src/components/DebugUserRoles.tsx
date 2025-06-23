import React from 'react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { supabase } from '@/lib/supabase';
import { useDispatch } from 'react-redux';
import { setRoles } from '@/features/auth/store/authSlice';
import { useAppSelector } from '@/store/hooks';

export const DebugUserRoles: React.FC = () => {
  const { user, loading } = useSession();
  const authState = useAppSelector(state => state.auth);
  const userRoles = authState.roles.list;
  const dispatch = useDispatch();

  const refreshRoles = async () => {
    if (!user?.id) return;
    
    console.log('Manually refreshing roles for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching roles:', error);
        return;
      }
      
      console.log('Fetched roles:', data);
      const roles = data?.map(r => r.role) || [];
      
      dispatch(setRoles(roles));
      console.log('Dispatched roles to Redux:', roles);
    } catch (err) {
      console.error('Exception refreshing roles:', err);
    }
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <div>Loading auth...</div>
      </div>
    );
  }

  // Safely handle userRoles
  const roles = userRoles || [];
  const rolesText = roles.length > 0 ? roles.join(', ') : 'No roles assigned';

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug: User Info</h3>
      <div className="text-sm space-y-1">
        <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
        <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        <p><strong>Roles:</strong> {rolesText}</p>
        <p><strong>Roles Array:</strong> {JSON.stringify(roles)}</p>
        <p><strong>Has Admin:</strong> {roles.includes('admin') ? 'Yes' : 'No'}</p>
        <p><strong>Has Superadmin:</strong> {roles.includes('superadmin') ? 'Yes' : 'No'}</p>
        <p><strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      </div>
      {user && (
        <button 
          onClick={refreshRoles}
          className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
        >
          Refresh Roles
        </button>
      )}
    </div>
  );
};