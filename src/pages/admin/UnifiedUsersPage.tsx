import React, { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { adminRolesApi } from '@/features/admin/api/roles';
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Mail,
  Users,
  Plus,
  UserPlus,
  Download,
  Upload,
  Eye,
  Archive,
  ChevronDown,
  FileUp,
  FileDown,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  MapPin,
  Briefcase,
  Building,
  Phone,
  Globe,
  Activity,
  Settings
} from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'react-hot-toast';
import { adminActivityLogger } from '@/services/adminActivityLogger';

interface UnifiedUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  location?: string;
  title?: string;
  company?: string;
  bio?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  status: 'active' | 'blocked' | 'archived';
  created_at: string;
  last_sign_in_at: string | null;
  updated_at: string;
  roles: Array<{ id: string; name: string }>;
  member_profile?: {
    id: string;
    published: boolean;
    featured: boolean;
    topics?: string[];
    skills?: string[];
  };
  activity?: {
    posts_count: number;
    events_count: number;
    groups_count: number;
    last_activity: string | null;
  };
}

interface EditModalProps {
  user: UnifiedUser;
  onClose: () => void;
  onSave: (updatedUser: Partial<UnifiedUser>) => Promise<void>;
}

const EditUserModal: React.FC<EditModalProps> = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    email: user.email,
    name: user.name || '',
    location: user.location || '',
    title: user.title || '',
    company: user.company || '',
    bio: user.bio || '',
    phone: user.phone || '',
    website: user.website || '',
    linkedin: user.linkedin || '',
    twitter: user.twitter || '',
    status: user.status,
    published: user.member_profile?.published || false,
    featured: user.member_profile?.featured || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white">Edit User Profile</h2>
          <p className="text-blue-100 text-sm mt-1">Update user account and profile information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Account Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'blocked' | 'archived' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Profile Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Published Profile</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Member</span>
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UnifiedUsersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [editingUser, setEditingUser] = useState<UnifiedUser | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<{ field: string; direction: 'asc' | 'desc' }>({ field: 'created_at', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch unified user data
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['unified-users', searchTerm, selectedRole, selectedStatus, currentPage, pageSize, sortBy],
    queryFn: async () => {
      // First try the simple query without join
      let { data: profiles, error } = await supabase
        .from('members')
        .select('*')
        .order(sortBy.field, { ascending: sortBy.direction === 'asc' })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      if (error) {
        console.error('Members query error:', error);
        throw error;
      }

      console.log('Members data:', profiles);

      const unifiedUsers: UnifiedUser[] = profiles?.map(profile => ({
        id: profile.user_id || profile.id,
        email: profile.email || (profile.name ? `${profile.name.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'unknown@example.com'),
        name: profile.name,
        avatar_url: profile.avatar_url,
        location: profile.location,
        title: profile.title,
        company: profile.company,
        bio: profile.bio,
        phone: profile.phone,
        website: profile.website,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        status: profile.status || 'active',
        created_at: profile.created_at,
        last_sign_in_at: null, // Will be null since we can't join with auth.users
        updated_at: profile.updated_at,
        roles: [],
        member_profile: {
          id: profile.id,
          published: profile.status === 'published',
          featured: profile.featured || false,
          topics: profile.topics,
          skills: profile.skills
        },
        activity: {
          posts_count: 0,
          events_count: 0,
          groups_count: 0,
          last_activity: null
        }
      })) || [];

      let filteredUsers = unifiedUsers;

      if (searchTerm) {
        filteredUsers = filteredUsers.filter(user =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.location?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedStatus !== 'all') {
        filteredUsers = filteredUsers.filter(user => user.status === selectedStatus);
      }

      return filteredUsers;
    }
  });

  // Fetch available roles
  const { data: roles } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: () => adminRolesApi.getRoles()
  });

  // Handle user actions dropdown
  const handleUserAction = async (userId: string, action: string) => {
    switch (action) {
      case 'view':
        window.open(`/directory/${userId}`, '_blank');
        break;
      case 'edit':
        const user = users?.find(u => u.id === userId);
        if (user) setEditingUser(user);
        break;
      case 'block':
        await updateUserStatus(userId, 'blocked');
        break;
      case 'archive':
        await updateUserStatus(userId, 'archived');
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
          await deleteUser(userId);
        }
        break;
    }
  };

  // Update user status
  const updateUserStatus = async (userId: string, status: string) => {
    const { error } = await supabase
      .from('members')
      .update({ status })
      .eq('user_id', userId);

    if (!error) {
      await adminActivityLogger.logUserAction(
        status === 'blocked' ? 'block' : status === 'archived' ? 'archive' : 'update',
        userId,
        { new_status: status }
      );
      toast.success(`User ${status} successfully`);
      refetch();
    } else {
      toast.error(`Failed to update user status`);
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('user_id', userId);

    if (!error) {
      await adminActivityLogger.logUserAction('delete', userId);
      toast.success('User deleted successfully');
      refetch();
    } else {
      toast.error('Failed to delete user');
    }
  };

  // Save user edits
  const saveUserEdits = async (updatedUser: Partial<UnifiedUser>) => {
    const { error } = await supabase
      .from('members')
      .update({
        name: updatedUser.name,
        location: updatedUser.location,
        title: updatedUser.title,
        company: updatedUser.company,
        bio: updatedUser.bio,
        phone: updatedUser.phone,
        website: updatedUser.website,
        linkedin: updatedUser.linkedin,
        twitter: updatedUser.twitter,
        status: updatedUser.status === 'active' ? 'published' : updatedUser.status
      })
      .eq('user_id', editingUser?.id);

    if (!error) {
      await adminActivityLogger.logUserAction('update', editingUser?.id || '', {
        fields_updated: Object.keys(updatedUser)
      });
      toast.success('User updated successfully');
      refetch();
    } else {
      toast.error('Failed to update user');
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    const userIds = Array.from(selectedUsers);

    switch (bulkAction) {
      case 'block':
        await Promise.all(userIds.map(id => updateUserStatus(id, 'blocked')));
        await adminActivityLogger.logBulkAction('block', 'user', userIds);
        break;
      case 'archive':
        await Promise.all(userIds.map(id => updateUserStatus(id, 'archived')));
        await adminActivityLogger.logBulkAction('archive', 'user', userIds);
        break;
      case 'activate':
        await Promise.all(userIds.map(id => updateUserStatus(id, 'active')));
        await adminActivityLogger.logBulkAction('activate', 'user', userIds);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete ${userIds.length} users? This action cannot be undone.`)) {
          await Promise.all(userIds.map(id => deleteUser(id)));
          await adminActivityLogger.logBulkAction('delete', 'user', userIds);
        }
        break;
      case 'export':
        exportUsers(userIds);
        await adminActivityLogger.logExport('user', userIds.length, 'csv', { selected_ids: userIds });
        break;
    }

    setSelectedUsers(new Set());
    setShowBulkActions(false);
    setBulkAction('');
  };

  // Export users to CSV
  const exportUsers = (userIds?: string[]) => {
    const dataToExport = userIds 
      ? users?.filter(u => userIds.includes(u.id))
      : users;

    if (!dataToExport) return;

    const csv = Papa.unparse(dataToExport.map(user => ({
      Email: user.email,
      Name: user.name,
      Title: user.title,
      Company: user.company,
      Location: user.location,
      Phone: user.phone,
      Website: user.website,
      LinkedIn: user.linkedin,
      Twitter: user.twitter,
      Status: user.status,
      CreatedAt: user.created_at,
      LastSignIn: user.last_sign_in_at
    })));

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${dataToExport.length} users`);
  };

  // Handle CSV import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setImportData(results.data);
        setShowImportModal(true);
      },
      error: () => {
        toast.error('Failed to parse CSV file');
      }
    });
  };

  // Process CSV import
  const processImport = async () => {
    if (importData.length === 0) return;

    const newMembers = importData.map(row => ({
      name: row.Name || row.name,
      email: row.Email || row.email,
      title: row.Title || row.title,
      company: row.Company || row.company,
      location: row.Location || row.location,
      phone: row.Phone || row.phone,
      website: row.Website || row.website,
      linkedin: row.LinkedIn || row.linkedin,
      twitter: row.Twitter || row.twitter,
      bio: row.Bio || row.bio,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
      .from('members')
      .insert(newMembers);

    if (!error) {
      await adminActivityLogger.logImport('user', newMembers.length, 'csv');
      toast.success(`Imported ${newMembers.length} users successfully`);
      setShowImportModal(false);
      setImportData([]);
      refetch();
    } else {
      toast.error('Failed to import users');
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked && users) {
      setSelectedUsers(new Set(users.map(user => user.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Unified User Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage all users and member profiles in one place
        </p>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <button
              onClick={() => exportUsers()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </button>

            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {roles?.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-blue-700 font-medium">
                {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
              </span>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-1 border border-blue-300 rounded text-sm bg-white"
              >
                <option value="">Select bulk action</option>
                <option value="activate">Activate</option>
                <option value="block">Block</option>
                <option value="archive">Archive</option>
                <option value="export">Export Selected</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedUsers(new Set());
                setBulkAction('');
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={(users?.length ?? 0) > 0 && selectedUsers.size === (users?.length ?? 0)}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Activity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : users?.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users?.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedUsers);
                        if (e.target.checked) {
                          newSelected.add(user.id);
                        } else {
                          newSelected.delete(user.id);
                        }
                        setSelectedUsers(newSelected);
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'Unnamed User'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.title || '-'}</div>
                    <div className="text-sm text-gray-500">{user.company || '-'}</div>
                    <div className="text-xs text-gray-400 flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {user.location || 'Not specified'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Activity className="h-4 w-4 mr-1" />
                        {user.activity?.posts_count || 0}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {user.activity?.events_count || 0}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {user.activity?.groups_count || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : user.status === 'blocked'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {user.status === 'blocked' && <Ban className="w-3 h-3 mr-1" />}
                      {user.status === 'archived' && <Archive className="w-3 h-3 mr-1" />}
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="relative inline-block text-left">
                      <select
                        onChange={(e) => handleUserAction(user.id, e.target.value)}
                        className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm hover:bg-gray-50 cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Actions</option>
                        <option value="edit">Edit</option>
                        <option value="view">View</option>
                        <option value="block">Block</option>
                        <option value="archive">Archive</option>
                        <option value="delete">Delete</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {users && users.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={users.length < pageSize}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={users.length < pageSize}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={saveUserEdits}
        />
      )}

      {/* Import Preview Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
              <h2 className="text-2xl font-bold text-white">Import Preview</h2>
              <p className="text-green-100 text-sm mt-1">Review {importData.length} records to import</p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {importData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm">{row.Name || row.name || '-'}</td>
                      <td className="px-4 py-2 text-sm">{row.Email || row.email || '-'}</td>
                      <td className="px-4 py-2 text-sm">{row.Title || row.title || '-'}</td>
                      <td className="px-4 py-2 text-sm">{row.Company || row.company || '-'}</td>
                      <td className="px-4 py-2 text-sm">{row.Location || row.location || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {importData.length > 10 && (
                <p className="text-sm text-gray-500 mt-4">
                  ... and {importData.length - 10} more records
                </p>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportData([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={processImport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Import {importData.length} Users
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedUsersPage;