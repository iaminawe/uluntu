import React from 'react';
import { ContentContainer } from '@/shared/components/ui/PageLayout';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/features/auth/store/authSlice';
import { Outlet, useNavigate } from 'react-router-dom';
import { DashboardSidebar } from '../DashboardSidebar';
import { DashboardHeader } from '../DashboardHeader';
import { useDashboardData } from '../../hooks/useDashboardData';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/components/ui/ErrorMessage';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const { data: dashboardData, isLoading, error } = useDashboardData();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/signin?redirect=/dashboard');
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <ContentContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </ContentContainer>
    );
  }

  if (error) {
    return (
      <ContentContainer>
        <ErrorMessage 
          title="Unable to load dashboard"
          message="Please try refreshing the page or contact support if the problem persists."
          action={{
            label: "Retry",
            onClick: () => window.location.reload()
          }}
        />
      </ContentContainer>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={dashboardData?.user} />
      
      <div className="flex">
        <DashboardSidebar 
          stats={dashboardData?.stats}
          className="hidden lg:block"
        />
        
        <main className="flex-1 lg:ml-64">
          <div className="py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;