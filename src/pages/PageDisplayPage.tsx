import React from 'react';
import { Navigate } from 'react-router-dom';
import { PageDetail } from '@/features/pages';
import { useEnabledFeatures } from '@/hooks/useSettings';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const PageDisplayPage: React.FC = () => {
  const { isFeatureEnabled, loading: featuresLoading } = useEnabledFeatures();
  const pagesEnabled = isFeatureEnabled('pages_system');

  // Redirect if pages feature is disabled
  if (!featuresLoading && !pagesEnabled) {
    return <Navigate to="/" replace />;
  }

  if (featuresLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageDetail showActions={false} />
    </div>
  );
};

export default PageDisplayPage;