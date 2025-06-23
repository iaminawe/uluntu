import React, { lazy, Suspense } from 'react';
import { AdminOnly } from '@/components/auth/PermissionGuard';
import AdminSettingsLayout from '@/components/admin/settings/AdminSettingsLayout';
import { useUnifiedSettings } from '@/features/admin/hooks/useUnifiedSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

// Lazy load section components for performance
const GeneralSettingsSection = lazy(() => import('@/components/admin/settings/GeneralSettingsSection'));
const UserManagementSection = lazy(() => import('@/components/admin/settings/UserManagementSection'));
const FeatureManagementSection = lazy(() => import('@/components/admin/settings/FeatureManagementSection'));
const SecuritySection = lazy(() => import('@/components/admin/settings/SecuritySection'));
const EmailSection = lazy(() => import('@/components/admin/settings/EmailSection'));
const PerformanceSection = lazy(() => import('@/components/admin/settings/PerformanceSection'));
const ContactSection = lazy(() => import('@/components/admin/settings/ContactSection'));
const AuditSection = lazy(() => import('@/components/admin/settings/AuditSection'));

const AdminSettingsPage: React.FC = () => {
  const {
    activeSection,
    settings,
    features,
    history,
    isLoading,
    error,
    permissions,
    updateSetting,
    updateFeature,
    deleteSetting,
    deleteFeature,
    refetch
  } = useUnifiedSettings();

  const renderSection = () => {
    const sharedProps = {
      settings,
      features,
      history,
      onUpdateSetting: updateSetting,
      onUpdateFeature: updateFeature,
      onDeleteSetting: deleteSetting,
      onDeleteFeature: deleteFeature,
      onRefresh: refetch,
      isLoading
    };

    switch (activeSection) {
      case 'general':
        return permissions.canViewGeneral ? (
          <Suspense fallback={<LoadingSpinner />}>
            <GeneralSettingsSection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      case 'users':
        return permissions.canViewUsers ? (
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagementSection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      case 'features':
        return permissions.canViewFeatures ? (
          <Suspense fallback={<LoadingSpinner />}>
            <FeatureManagementSection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      case 'security':
        return permissions.canViewSecurity ? (
          <Suspense fallback={<LoadingSpinner />}>
            <SecuritySection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      case 'email':
        return permissions.canViewEmail ? (
          <Suspense fallback={<LoadingSpinner />}>
            <EmailSection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      case 'performance':
        return permissions.canViewPerformance ? (
          <Suspense fallback={<LoadingSpinner />}>
            <PerformanceSection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      case 'contact':
        return permissions.canViewContact ? (
          <Suspense fallback={<LoadingSpinner />}>
            <ContactSection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      case 'audit':
        return permissions.canViewAudit ? (
          <Suspense fallback={<LoadingSpinner />}>
            <AuditSection {...sharedProps} />
          </Suspense>
        ) : (
          <UnauthorizedSection />
        );
      
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Settings Section Not Found
            </h3>
            <p className="text-gray-600">
              The requested settings section could not be loaded.
            </p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorAlert
          title="Failed to load settings"
          message={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600">
              This area is restricted to administrators only.
            </p>
          </div>
        </div>
      }
    >
      <AdminSettingsLayout>
        {renderSection()}
      </AdminSettingsLayout>
    </AdminOnly>
  );
};

// Component for unauthorized sections
const UnauthorizedSection: React.FC = () => (
  <div className="text-center py-12">
    <div className="text-4xl mb-4">🔒</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Insufficient Permissions
    </h3>
    <p className="text-gray-600">
      You don't have the required permissions to access this section.
    </p>
  </div>
);

export default AdminSettingsPage;
