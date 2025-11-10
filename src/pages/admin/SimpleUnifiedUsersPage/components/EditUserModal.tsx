import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminRolesApi } from '@/features/admin/api/roles';
import {
  Shield,
  Ban,
  User,
  Briefcase,
  Save,
  X,
  Archive,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { AdminUser, UserFormData } from '../types';

export interface EditUserModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (userId: string, updates: any) => Promise<void>;
  currentUserRoles: string[];
}

/**
 * EditUserModal - Modal component for editing user details, profile, and roles
 * Features:
 * - Tab-based interface (Account, Profile, Roles)
 * - Role management with permission checks
 * - Quick actions (Block, Unblock, Archive)
 * - Form validation and loading states
 */
export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSave,
  currentUserRoles
}) => {
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState<UserFormData>({
    email: user.email,
    name: user.name || '',
    location: user.member_profile?.location || '',
    title: user.member_profile?.title || '',
    company: user.member_profile?.company || '',
    bio: user.member_profile?.bio || '',
    status: user.member_profile?.status || 'draft',
    featured: user.member_profile?.featured || false
  });

  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set(user.roles));
  const [loading, setLoading] = useState(false);

  const isSuperAdmin = currentUserRoles.includes('superadmin');
  const canEditRoles = isSuperAdmin || currentUserRoles.includes('admin');

  const { data: availableRoles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminRolesApi.getRoles()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSave(user.user_id, {
        profile: formData,
        roles: Array.from(selectedRoles)
      });
      onClose();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId: string) => {
    const newRoles = new Set(selectedRoles);
    if (newRoles.has(roleId)) {
      newRoles.delete(roleId);
    } else {
      newRoles.add(roleId);
    }
    setSelectedRoles(newRoles);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Edit User Profile</h2>
          <p className="text-blue-100 text-sm mt-1">{user.email}</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <User className="inline-block h-4 w-4 mr-2" />
              Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Briefcase className="inline-block h-4 w-4 mr-2" />
              Profile
            </button>
            {canEditRoles && (
              <button
                type="button"
                onClick={() => setActiveTab('roles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'roles'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Shield className="inline-block h-4 w-4 mr-2" />
                Roles
              </button>
            )}
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  readOnly
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed here - managed by authentication system</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Enter full name"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profile Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="draft">Draft (Private)</option>
                  <option value="published">Published (Visible)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Featured Member
                </label>
              </div>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          )}

          {/* Roles Tab */}
          {activeTab === 'roles' && canEditRoles && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Role Assignment
                  {isSuperAdmin && <span className="text-sm font-normal text-blue-600 ml-2">(Super Admin)</span>}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {availableRoles?.map(role => {
                    const hasRole = selectedRoles.has(role.id);
                    const canToggleRole = isSuperAdmin || role.id !== 'superadmin';

                    return (
                      <label
                        key={role.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                          hasRole
                            ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700'
                            : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                        } ${!canToggleRole ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-600'}`}
                      >
                        <input
                          type="checkbox"
                          checked={hasRole}
                          onChange={() => canToggleRole && toggleRole(role.id)}
                          disabled={!canToggleRole}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{role.name}</div>
                          {role.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{role.description}</div>
                          )}
                        </div>
                        {role.id === 'superadmin' && (
                          <Shield className="h-4 w-4 text-red-500 ml-2" />
                        )}
                      </label>
                    );
                  })}
                </div>
                {!isSuperAdmin && (
                  <p className="text-xs text-gray-500 mt-3">
                    <AlertTriangle className="inline h-3 w-3 mr-1" />
                    Note: Only Super Admins can assign the Super Admin role
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {user.email !== 'No account' && (
                  <>
                    {user.member_profile?.status !== 'blocked' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSave(user.user_id, {
                            profile: { ...formData, status: 'blocked' },
                            roles: Array.from(selectedRoles)
                          });
                        }}
                        className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center text-sm"
                      >
                        <Ban className="h-4 w-4 mr-1" />
                        Block
                      </button>
                    )}
                    {user.member_profile?.status === 'blocked' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSave(user.user_id, {
                            profile: { ...formData, status: 'published' },
                            roles: Array.from(selectedRoles)
                          });
                        }}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Unblock
                      </button>
                    )}
                    {user.member_profile?.status !== 'archived' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSave(user.user_id, {
                            profile: { ...formData, status: 'archived' },
                            roles: Array.from(selectedRoles)
                          });
                        }}
                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center text-sm"
                      >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </button>
                    )}
                  </>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
