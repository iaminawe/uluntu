import React from 'react';
import { useAuth } from '@/shared/contexts/AuthContext';

export const DebugUserRoles: React.FC = () => {
  const { user, userRoles, loading } = useAuth();

  if (loading) {
    return <div>Loading auth...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">Debug: User Info</h3>
      <div className="text-sm">
        <p><strong>Email:</strong> {user?.email || 'Not logged in'}</p>
        <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        <p><strong>Roles:</strong> {userRoles.length > 0 ? userRoles.join(', ') : 'No roles assigned'}</p>
        <p><strong>Has Admin:</strong> {userRoles.includes('admin') ? 'Yes' : 'No'}</p>
        <p><strong>Has Superadmin:</strong> {userRoles.includes('superadmin') ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};