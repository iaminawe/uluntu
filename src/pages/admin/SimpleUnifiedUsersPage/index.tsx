import React from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditUserModal } from './components/EditUserModal';
import { DeleteUserModal } from './components/DeleteUserModal';
import { ImportUsersModal } from './components/ImportUsersModal';
import { UserTable } from './components/UserTable';
import { UserFilters } from './components/UserFilters';
import { BulkActionsPanel } from './components/BulkActionsPanel';
import { useUserManagement } from './hooks/useUserManagement';
import { useUserFilters } from './hooks/useUserFilters';
import { useUserImport } from './hooks/useUserImport';
import { FeatureErrorBoundary } from '@/components/ErrorBoundary';
import { UsersErrorFallback } from '@/components/ErrorBoundary/FeatureSpecificFallbacks';

/**
 * SimpleUnifiedUsersPage - Main user management page
 * Refactored from 1,793-line monolith into focused, maintainable components
 *
 * Structure:
 * - /components - UI components (<300 lines each)
 * - /hooks - Custom hooks for state and logic
 * - /types.ts - TypeScript interfaces
 */
const SimpleUnifiedUsersPageContent: React.FC = () => {
  // User management hook (permissions, CRUD operations, role management)
  const {
    editingUser,
    selectedUsers,
    showBulkActions,
    bulkActionRole,
    showDeleteModal,
    deleteOptions,
    showActionDropdown,
    currentUserRoles,
    isSuperAdmin,
    isAdmin,
    canEditRoles,
    roles,
    setEditingUser,
    setSelectedUsers,
    setShowBulkActions,
    setBulkActionRole,
    setShowDeleteModal,
    setDeleteOptions,
    setShowActionDropdown,
    handleUserSelect,
    handleSelectAll,
    handleBulkAssign,
    handleBulkAction,
    handleUserAction,
    handleDeleteUser,
    handleSaveUser,
    bulkAssignRoleMutation
  } = useUserManagement();

  // User filters hook (search, role filter, pagination)
  const {
    searchTerm,
    selectedRole,
    currentPage,
    pageSize,
    showOrphanedProfiles,
    users,
    isLoading,
    setSearchTerm,
    setSelectedRole,
    setCurrentPage,
    setShowOrphanedProfiles,
    refetch,
    formatDate
  } = useUserFilters(isAdmin);

  // Import/export hook (CSV operations)
  const {
    showImportModal,
    importPreview,
    isExporting,
    isImporting,
    setShowImportModal,
    setImportFile,
    setImportPreview,
    exportToCSV,
    handleFileUpload,
    processImport
  } = useUserImport(canEditRoles);

  // Access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-2xl mx-auto text-center mt-20">
          <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need admin or superadmin privileges to access user management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                User Management
                {isSuperAdmin && <span className="text-sm font-normal text-blue-600 ml-2">(Super Admin)</span>}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {showOrphanedProfiles
                  ? `Showing orphaned profiles (no user account) • ${users?.length || 0} profiles`
                  : `Manage user accounts, profiles, roles, and permissions • ${users?.length || 0} users shown`
                }
              </p>
            </div>
            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showOrphanedProfiles}
                  onChange={(e) => {
                    setShowOrphanedProfiles(e.target.checked);
                    setCurrentPage(1); // Reset to first page
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Show Orphaned Profiles</span>
              </label>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <UserFilters
          searchTerm={searchTerm}
          selectedRole={selectedRole}
          roles={roles}
          selectedUsers={selectedUsers}
          showBulkActions={showBulkActions}
          isExporting={isExporting}
          onSearchChange={setSearchTerm}
          onRoleChange={setSelectedRole}
          onRefresh={refetch}
          onExport={exportToCSV}
          onFileUpload={handleFileUpload}
          onBulkActionsToggle={() => setShowBulkActions(!showBulkActions)}
          onBulkAction={(action) => handleBulkAction(action, users || [])}
        />

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedUsers.size > 0 && (
          <BulkActionsPanel
            selectedUsersCount={selectedUsers.size}
            bulkActionRole={bulkActionRole}
            roles={roles}
            isSuperAdmin={isSuperAdmin}
            isAssigning={bulkAssignRoleMutation.isPending}
            onRoleChange={setBulkActionRole}
            onBulkAssign={handleBulkAssign}
            onClearSelection={() => {
              setSelectedUsers(new Set());
              setShowBulkActions(false);
              setBulkActionRole('');
            }}
          />
        )}

        {/* Users Table */}
        <UserTable
          users={users}
          roles={roles}
          isLoading={isLoading}
          selectedUsers={selectedUsers}
          showActionDropdown={showActionDropdown}
          pageSize={pageSize}
          currentPage={currentPage}
          onSelectAll={(checked) => handleSelectAll(users || [], checked)}
          onSelectUser={handleUserSelect}
          onUserAction={(userId, action) => handleUserAction(userId, action, users || [])}
          onActionDropdownToggle={setShowActionDropdown}
          onPageChange={setCurrentPage}
          formatDate={formatDate}
        />

        {/* Edit User Modal */}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleSaveUser}
            currentUserRoles={currentUserRoles}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <DeleteUserModal
            user={showDeleteModal}
            users={users || []}
            deleteOptions={deleteOptions}
            onClose={() => {
              setShowDeleteModal(null);
              setDeleteOptions({ deleteContent: false, reassignTo: '', makeAnonymous: false });
            }}
            onDelete={handleDeleteUser}
            onOptionsChange={setDeleteOptions}
          />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ImportUsersModal
            importPreview={importPreview}
            isImporting={isImporting}
            onClose={() => {
              setShowImportModal(false);
              setImportFile(null);
              setImportPreview([]);
            }}
            onImport={processImport}
          />
        )}
      </div>
    </div>
  );
};

/**
 * SimpleUnifiedUsersPage - Wrapped with error boundary for graceful failure handling
 */
const SimpleUnifiedUsersPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <FeatureErrorBoundary
      featureName="User Management"
      fallback={
        <UsersErrorFallback
          onRetry={() => window.location.reload()}
          onGoBack={() => navigate('/admin')}
        />
      }
    >
      <SimpleUnifiedUsersPageContent />
    </FeatureErrorBoundary>
  );
};

export default SimpleUnifiedUsersPage;
