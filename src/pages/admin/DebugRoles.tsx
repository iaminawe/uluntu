import React, { useEffect, useState } from 'react';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';

const DebugRoles: React.FC = () => {
  const { user, session } = useSession();
  const authState = useAppSelector(state => state.auth);
  const [dbRoles, setDbRoles] = useState<any[]>([]);
  const [memberData, setMemberData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user?.id) return;

      try {
        // Fetch user roles from database
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select(`
            *,
            roles (*)
          `)
          .eq('user_id', user.id);

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
        } else {
          setDbRoles(rolesData || []);
        }

        // Fetch member data
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (memberError) {
          console.error('Error fetching member:', memberError);
        } else {
          setMemberData(member);
        }

        // Check if user is in admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .single();

        console.log('Admin table check:', { adminData, adminError });

      } catch (error) {
        console.error('Error in fetchRoles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [user]);

  const hasAdminAccess = authState.roles.list?.includes('superadmin') || authState.roles.list?.includes('admin');
  const isSuperAdmin = authState.roles.list?.includes('superadmin');

  return (
    <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-lg">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Debug: User Roles & Permissions</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Current User</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify({ 
            id: user?.id,
            email: user?.email,
            role: user?.role,
            app_metadata: user?.app_metadata
          }, null, 2)}</pre>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Redux Auth State</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify({
            isAuthenticated: authState.isAuthenticated,
            roles: authState.roles.list,
            hasAdminAccess,
            isSuperAdmin
          }, null, 2)}</pre>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Database Roles</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="text-sm overflow-auto">{JSON.stringify(dbRoles, null, 2)}</pre>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Member Data</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="text-sm overflow-auto">{JSON.stringify(memberData, null, 2)}</pre>
          )}
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Access Check Results</h2>
          <ul className="space-y-1">
            <li>Has Admin Access: {hasAdminAccess ? '✅ Yes' : '❌ No'}</li>
            <li>Is Super Admin: {isSuperAdmin ? '✅ Yes' : '❌ No'}</li>
            <li>Can Access /admin: {hasAdminAccess ? '✅ Yes' : '❌ No'}</li>
            <li>Can Access /admin/media: {hasAdminAccess ? '✅ Yes' : '❌ No'}</li>
          </ul>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded">
          <h2 className="font-semibold mb-2">How to Fix Access Issues</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Check if user has an entry in the `user_roles` table</li>
            <li>Verify the role is either 'admin' or 'superadmin'</li>
            <li>Check if there's an entry in the `members` table</li>
            <li>Run this SQL to grant admin access:
              <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
{`-- First, check if roles exist
SELECT * FROM roles;

-- If admin role doesn't exist, create it
INSERT INTO roles (name, description) 
VALUES ('admin', 'Administrator role')
ON CONFLICT (name) DO NOTHING;

-- Grant admin role to user
INSERT INTO user_roles (user_id, role_id)
SELECT '${user?.id || 'YOUR_USER_ID'}', id
FROM roles WHERE name = 'admin'
ON CONFLICT DO NOTHING;`}
              </pre>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DebugRoles;