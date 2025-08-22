import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function CheckAdminStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check user roles
  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
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

  // Check member profile
  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['user-member', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      return data;
    },
    enabled: !!user
  });

  const createAdminRole = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'admin'
        });
      
      if (error) throw error;
      alert('Admin role created! Refresh the page.');
    } catch (error: any) {
      alert('Error creating admin role: ' + error.message);
    }
  };

  const createMemberProfile = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .insert({
          user_id: user.id,
          name: user.email?.split('@')[0] || 'Admin User',
          email: user.email,
          status: 'published'
        });
      
      if (error) throw error;
      alert('Member profile created! Refresh the page.');
    } catch (error: any) {
      alert('Error creating member profile: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Admin Status Check</h1>
      
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* User Info */}
        <div>
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          {user ? (
            <div className="space-y-1">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Authenticated:</strong> ✅ Yes</p>
            </div>
          ) : (
            <p className="text-red-600">❌ Not authenticated</p>
          )}
        </div>

        {/* Member Profile */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Member Profile</h2>
          {memberLoading ? (
            <p>Loading...</p>
          ) : member ? (
            <div className="space-y-1">
              <p><strong>Name:</strong> {member.name}</p>
              <p><strong>Status:</strong> {member.status}</p>
              <p><strong>Member ID:</strong> {member.id}</p>
              <p className="text-green-600">✅ Member profile exists</p>
            </div>
          ) : (
            <div>
              <p className="text-yellow-600">⚠️ No member profile found</p>
              <Button onClick={createMemberProfile} className="mt-2">
                Create Member Profile
              </Button>
            </div>
          )}
        </div>

        {/* User Roles */}
        <div>
          <h2 className="text-lg font-semibold mb-2">User Roles</h2>
          {rolesLoading ? (
            <p>Loading...</p>
          ) : userRoles && userRoles.length > 0 ? (
            <div>
              <ul className="space-y-1">
                {userRoles.map((role, index) => (
                  <li key={index}>
                    <span className="inline-flex px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                      {role.role}
                    </span>
                  </li>
                ))}
              </ul>
              {userRoles.some(r => ['admin', 'superadmin'].includes(r.role)) ? (
                <p className="text-green-600 mt-2">✅ Has admin privileges</p>
              ) : (
                <p className="text-yellow-600 mt-2">⚠️ No admin role found</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-yellow-600">⚠️ No roles assigned</p>
              <Button onClick={createAdminRole} className="mt-2">
                Create Admin Role
              </Button>
            </div>
          )}
        </div>

        {/* Test Links */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Test Admin Access</h2>
          <div className="space-y-2">
            <Button 
              onClick={() => navigate('/admin')}
              variant="primary"
            >
              Try Admin Dashboard
            </Button>
            <Button 
              onClick={() => navigate('/admin/pages/test')}
              variant="secondary"
            >
              Try Pages Test
            </Button>
            <Button 
              onClick={() => navigate('/admin/pages')}
              variant="secondary"
            >
              Try Pages Management
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}