import React, { useState } from 'react';
import { adminRolesApi } from '@/features/admin/api/roles';

interface RoleAssignmentUtilityProps {
  userId?: string;
  userEmail?: string;
}

/**
 * Temporary utility component to assign roles to users
 * This can be added to a page temporarily to fix role assignments
 */
export const RoleAssignmentUtility: React.FC<RoleAssignmentUtilityProps> = ({
  userId = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8',
  userEmail = 'gregg@iaminawe.com'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentRoles, setCurrentRoles] = useState<string[]>([]);

  const checkRoles = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const roles = await adminRolesApi.getUserRoles(userId);
      setCurrentRoles(roles.map(r => r.id));
      setMessage(`Current roles: ${roles.map(r => r.id).join(', ') || 'none'}`);
    } catch (error) {
      setMessage(`Error checking roles: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const assignAuthenticatedRole = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Check current roles first
      const currentRoles = await adminRolesApi.getUserRoles(userId);
      const hasAuthenticated = currentRoles.some(role => role.id === 'authenticated');
      
      if (hasAuthenticated) {
        setMessage('✅ User already has authenticated role');
        return;
      }
      
      // Assign the role
      const success = await adminRolesApi.assignRole(userId, 'authenticated');
      
      if (success) {
        setMessage('✅ Successfully assigned authenticated role');
        
        // Verify
        const updatedRoles = await adminRolesApi.getUserRoles(userId);
        setCurrentRoles(updatedRoles.map(r => r.id));
        setMessage(prev => prev + `\nUpdated roles: ${updatedRoles.map(r => r.id).join(', ')}`);
      } else {
        setMessage('❌ Failed to assign authenticated role');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const assignAdminRole = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const success = await adminRolesApi.assignRole(userId, 'admin');
      
      if (success) {
        setMessage('✅ Successfully assigned admin role');
        const updatedRoles = await adminRolesApi.getUserRoles(userId);
        setCurrentRoles(updatedRoles.map(r => r.id));
        setMessage(prev => prev + `\nUpdated roles: ${updatedRoles.map(r => r.id).join(', ')}`);
      } else {
        setMessage('❌ Failed to assign admin role');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Role Assignment Utility</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600">User: {userEmail}</p>
        <p className="text-sm text-gray-600">ID: {userId}</p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={checkRoles}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Check Current Roles'}
        </button>
        
        <button
          onClick={assignAuthenticatedRole}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Assign Authenticated Role'}
        </button>
        
        <button
          onClick={assignAdminRole}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Assign Admin Role'}
        </button>
      </div>
      
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-sm whitespace-pre-line">
          {message}
        </div>
      )}
      
      {currentRoles.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Current Roles:</h3>
          <ul className="list-disc list-inside text-sm">
            {currentRoles.map(role => (
              <li key={role}>{role}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};