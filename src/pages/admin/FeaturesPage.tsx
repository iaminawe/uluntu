import React from 'react';
import { AdminOnly } from '@/components/auth/PermissionGuard';
import { useUnifiedSettings } from '@/features/admin/hooks/useUnifiedSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { ErrorCode } from '@/utils/errorSanitization';
import FeatureManagementSection from '@/components/admin/settings/FeatureManagementSection';
import { Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  const {
    features,
    isLoading,
    error,
    permissions,
    updateFeature,
    deleteFeature,
    refetch
  } = useUnifiedSettings();

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
          error={{ userMessage: error, errorCode: ErrorCode.GENERIC_UNKNOWN, debugId: Date.now().toString(), timestamp: new Date().toISOString() }}
          onRetry={refetch}
          canRetry={true}
        />
      </div>
    );
  }

  if (!permissions.canViewFeatures) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Insufficient Permissions
        </h3>
        <p className="text-gray-600">
          You don't have the required permissions to access feature management.
        </p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Admin
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Feature Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Configure and manage platform features and capabilities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Management Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <FeatureManagementSection
            features={features}
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