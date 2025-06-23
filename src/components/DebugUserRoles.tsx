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
    
    console.log('🔄 MANUALLY REFRESHING ROLES for user:', user.id);
    console.log('🔄 User email:', user.email);
    
    try {
      console.log('🔄 Querying user_roles table...');
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      console.log('🔄 Database query completed');
      console.log('🔄 Error:', error);
      console.log('🔄 Data:', data);
      console.log('🔄 Data length:', data?.length || 0);
      
      if (error) {
        console.error('❌ ERROR fetching roles:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        return;
      }
      
      console.log('✅ FETCHED ROLES DATA:', data);
      const roles = data?.map(r => r.role) || [];
      console.log('✅ MAPPED ROLES ARRAY:', roles);
      
      dispatch(setRoles(roles));
      console.log('✅ DISPATCHED ROLES TO REDUX:', roles);
      
      // Additional verification
      if (roles.length === 0) {
        console.warn('⚠️  NO ROLES FOUND - User may not have any roles assigned in database');
        console.warn('⚠️  Check: SELECT * FROM user_roles WHERE user_id = \'' + user.id + '\';');
      }
    } catch (err) {
      console.error('💥 EXCEPTION refreshing roles:', err);
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
        <div className="mt-2 space-y-1">
          <button 
            onClick={refreshRoles}
            className="block w-full px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
          >
            Refresh Roles
          </button>
          <button 
            onClick={() => {
              console.log('🔧 FORCING ADMIN ROLE for debugging...');
              dispatch(setRoles(['admin']));
              console.log('🔧 Admin role forced in Redux');
            }}
            className="block w-full px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
          >
            Force Admin (Debug)
          </button>
          <div className="text-xs mt-1 opacity-75">
            <p>Super Admin ID: {import.meta.env.VITE_SUPER_ADMIN_USER_ID || 'Not set'}</p>
            <p>Current ID: {user.id}</p>
            <p>Match: {import.meta.env.VITE_SUPER_ADMIN_USER_ID === user.id ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
};