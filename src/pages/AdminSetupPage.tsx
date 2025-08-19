import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { Shield, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminSetupPage: React.FC = () => {
  const { user } = useSession();
  const [loading, setLoading] = useState(false);
  const [currentRoles, setCurrentRoles] = useState<string[]>([]);
  const [tableExists, setTableExists] = useState<boolean | null>(null);

  useEffect(() => {
    if (user) {
      checkUserRoles();
      checkTableExists();
    }
  }, [user]);

  const checkTableExists = async () => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .select('count')
        .limit(1);
      
      setTableExists(!error);
    } catch (err) {
      setTableExists(false);
    }
  };

  const checkUserRoles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (!error && data) {
        setCurrentRoles(data.map(r => r.role));
      }
    } catch (err) {
      console.error('Error checking roles:', err);
    }
  };

  const assignAdminRole = async () => {
    if (!user) {
      toast.error('You must be logged in to assign roles');
      return;
    }

    setLoading(true);
    
    try {
      // First, try to insert the roles
      const rolesToAssign = [
        { user_id: user.id, role: 'admin' },
        { user_id: user.id, role: 'superadmin' }
      ];

      const { error: insertError } = await supabase
        .from('user_roles')
        .upsert(rolesToAssign, { onConflict: 'user_id,role' });

      if (insertError) {
        console.error('Insert error:', insertError);
        
        // If insert fails, try to use the function
        const { error: fnError } = await supabase
          .rpc('assign_admin_role', { target_user_id: user.id });
        
        if (fnError) {
          throw new Error(`Failed to assign roles: ${fnError.message}`);
        }
      }

      toast.success('Admin roles assigned successfully! Please refresh the page.');
      await checkUserRoles();
      
      // Refresh the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      console.error('Error assigning admin role:', error);
      toast.error(error.message || 'Failed to assign admin roles');
    } finally {
      setLoading(false);
    }
  };

  const createUserRolesTable = async () => {
    setLoading(true);
    
    try {
      // Execute the SQL to create the table
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS user_roles (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, role)
          );
          
          ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own roles" ON user_roles
            FOR SELECT
            USING (auth.uid() = user_id);
        `
      });

      if (error) {
        throw error;
      }

      toast.success('User roles table created successfully!');
      await checkTableExists();
      
    } catch (error: any) {
      console.error('Error creating table:', error);
      toast.error('Failed to create user_roles table. You may need to run the migration manually.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Logged In</h2>
            <p className="text-gray-600">Please log in to set up admin access</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Setup</h1>
          <p className="text-gray-600">Configure admin access for your account</p>
        </div>

        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Current User</h3>
            <p className="text-sm text-gray-600">Email: {user.email}</p>
            <p className="text-sm text-gray-600">ID: {user.id}</p>
          </div>

          {/* Table Status */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Database Status</h3>
            <div className="flex items-center space-x-2">
              {tableExists === null ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-600">Checking...</span>
                </>
              ) : tableExists ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">user_roles table exists</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">user_roles table not found</span>
                </>
              )}
            </div>
            
            {tableExists === false && (
              <button
                onClick={createUserRolesTable}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create user_roles Table'}
              </button>
            )}
          </div>

          {/* Current Roles */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Current Roles</h3>
            {currentRoles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentRoles.map(role => (
                  <span
                    key={role}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    {role}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No roles assigned</p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={assignAdminRole}
              disabled={loading || !tableExists}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Assigning Roles...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Assign Admin & Superadmin Roles</span>
                </>
              )}
            </button>

            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh Page</span>
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Make sure you're logged in with the account you want to make admin</li>
              <li>Click "Assign Admin & Superadmin Roles" button</li>
              <li>Wait for the success message</li>
              <li>Refresh the page to apply the new roles</li>
              <li>Navigate to /admin to access the admin panel</li>
            </ol>
          </div>

          {/* Manual SQL */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Manual SQL (if needed)</h3>
            <p className="text-xs text-gray-600 mb-2">Run this in Supabase SQL Editor:</p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`-- Insert admin roles for your user
INSERT INTO user_roles (user_id, role) VALUES 
  ('${user.id}', 'admin'),
  ('${user.id}', 'superadmin')
ON CONFLICT (user_id, role) DO NOTHING;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;