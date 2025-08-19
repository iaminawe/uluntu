import React from 'react';
import { AdminOnly } from '@/components/auth/PermissionGuard';
import { useUnifiedSettings } from '@/features/admin/hooks/useUnifiedSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ErrorCode } from '@/utils/errorSanitization';
import FeatureManagementSection from '@/components/admin/settings/FeatureManagementSection';
import { Zap } from 'lucide-react';

const FeaturesPage: React.FC = () => {
  const {
    allFeatures,
    isLoading,
    error,
    permissions,
    updateFeature,
    deleteFeature,
    refetch
  } = useUnifiedSettings();

  // Use allFeatures directly instead of filtered features
  const displayFeatures = allFeatures;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <ErrorAlert
          error={{ userMessage: error, errorCode: ErrorCode.GENERIC_UNKNOWN, debugId: Date.now().toString(), timestamp: new Date().toISOString() }}
          onRetry={refetch}
          canRetry={true}
        />
      </div>
    );
  }

  if (!permissions.canViewFeatures) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Insufficient Permissions
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You don't have the required permissions to access feature management.
        </p>
      </div>
    );
  }

  return (
    <AdminOnly
      fallback={
        <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Admin Access Required
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              This area is restricted to administrators only.
            </p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Feature Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Configure and manage platform features and capabilities
              </p>
            </div>
          </div>
        </div>

        {/* Feature Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <FeatureManagementSection
            features={displayFeatures}
            onUpdateFeature={updateFeature}
            onRefresh={refetch}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminOnly>
  );
};

export default FeaturesPage;