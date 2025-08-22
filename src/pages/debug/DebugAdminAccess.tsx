import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function DebugAdminAccess() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authState = useAppSelector(state => state.auth);

  // Check database roles directly
  const { data: dbRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['debug-user-roles', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Force refresh roles in Redux
  const forceRefreshAuth = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Debug Admin Access</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">User Information</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>ID:</strong> <code className="text-sm bg-gray-100 px-1 rounded">{user.id}</code></p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Authenticated:</strong> ✅ Yes</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
        </div>

        {/* Redux State */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Redux Auth State</h2>
          <div className="space-y-2">
            <p><strong>Is Authenticated:</strong> {authState.isAuthenticated ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Session Checked:</strong> {authState.sessionChecked ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Roles Loading:</strong> {authState.roles.loading ? '⏳ Loading' : '✅ Done'}</p>
            <p><strong>Roles in Redux:</strong></p>
            <ul className="ml-4">
              {authState.roles.list.length > 0 ? (
                authState.roles.list.map((role, i) => (
                  <li key={i} className="flex items-center">
                    <span className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded mr-2">
                      {role}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-yellow-600">⚠️ No roles in Redux</li>
              )}
            </ul>
          </div>
        </div>

        {/* Database Roles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Database Roles</h2>
          {rolesLoading ? (
            <p>⏳ Loading...</p>
          ) : (
            <div className="space-y-2">
              {dbRoles && dbRoles.length > 0 ? (
                <>
                  <p className="text-green-600">✅ Found {dbRoles.length} role(s) in database:</p>
                  <ul className="ml-4 space-y-1">
                    {dbRoles.map((role, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          {role.role}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(role.created_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-yellow-600">⚠️ No roles found in database</p>
              )}
            </div>
          )}
        </div>

        {/* Admin Check */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Admin Access Check</h2>
          <div className="space-y-2">
            <p><strong>Has Admin in Redux:</strong> {authState.roles.list.includes('admin') || authState.roles.list.includes('superadmin') ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Has Admin in DB:</strong> {dbRoles?.some(r => ['admin', 'superadmin'].includes(r.role)) ? '✅ Yes' : '❌ No'}</p>
            <p><strong>Should Have Access:</strong> {(dbRoles?.some(r => ['admin', 'superadmin'].includes(r.role)) && authState.sessionChecked) ? '✅ Yes' : '❌ No'}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <Button onClick={forceRefreshAuth} variant="primary">
              🔄 Refresh Auth State
            </Button>
            
            <div className="space-x-2">
              <Button 
                onClick={() => navigate('/admin/pages/test')}
                variant="secondary"
                disabled={!authState.roles.list.includes('admin') && !authState.roles.list.includes('superadmin')}
              >
                🚀 Try Admin Pages Test
              </Button>
              
              <Button 
                onClick={() => navigate('/simple-page-test')}
                variant="secondary"
              >
                📝 Simple Page Test (No Auth)
              </Button>
            </div>
          </div>
        </div>

        {/* Direct Links */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Direct Test Links</h2>
          <div className="space-y-2">
            <div>
              <a 
                href="/simple-page-test" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                📝 Simple Page Test (No Admin Required)
              </a>
            </div>
            <div>
              <a 
                href="/test-editor" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                ✏️ Block Editor Test
              </a>
            </div>
            <div>
              <a 
                href="/admin/pages/test" 
                className="text-blue-600 hover:underline"
                target="_blank"
              >
                🔐 Admin Pages Test (Requires Admin)
              </a>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Troubleshooting</h2>
          <div className="space-y-2 text-sm">
            <p><strong>If you have admin in DB but not Redux:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Click "Refresh Auth State" above</li>
              <li>Or try hard refresh (Cmd+Shift+R)</li>
              <li>Check if auth role loading is working properly</li>
            </ol>
            
            <p className="mt-4"><strong>If you don't have admin in DB:</strong></p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Run the SQL script in Supabase to grant admin role</li>
              <li>Or use the "Simple Page Test" which doesn't require admin</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}