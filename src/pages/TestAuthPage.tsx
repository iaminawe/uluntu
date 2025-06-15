import React from 'react';
import { useAuth } from '@/shared/contexts/AuthContextWithRedux';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

export default function TestAuthPage() {
  const { user, userRoles, loading } = useAuth();
  const navigate = useNavigate();
  const reduxAuth = useAppSelector(state => state.auth);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Current Auth State:</h2>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>User: {user?.email || 'Not logged in'}</p>
        <p>User ID: {user?.id || 'N/A'}</p>
        <p>Roles: {userRoles?.join(', ') || 'No roles'}</p>
        <p>Has superadmin: {userRoles?.includes('superadmin') ? 'Yes' : 'No'}</p>
        <p>Has admin: {userRoles?.includes('admin') ? 'Yes' : 'No'}</p>
      </div>

      <div className="bg-blue-100 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Redux Auth State:</h2>
        <p>Status: {reduxAuth.status}</p>
        <p>User: {reduxAuth.user?.email || 'Not in Redux'}</p>
        <p>Roles List: {reduxAuth.roles.list.join(', ') || 'No roles in Redux'}</p>
        <p>Is Admin (Redux): {reduxAuth.roles.isAdmin ? 'Yes' : 'No'}</p>
        <p>Roles Loading: {reduxAuth.roles.loading ? 'Yes' : 'No'}</p>
        <p>Session: {reduxAuth.session ? 'Active' : 'None'}</p>
      </div>

      <div className="space-x-2">
        <button 
          onClick={() => navigate('/admin')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Admin Route
        </button>
        
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}