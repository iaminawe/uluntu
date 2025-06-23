import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export default function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading } = useSession();
  const authState = useAppSelector(state => state.auth);
  const userRoles = authState.roles.list;
  const location = useLocation();
  
  console.log('🔐 ProtectedRoute Debug:', {
    path: location.pathname,
    user: user?.email,
    loading,
    userRoles,
    requiredRoles,
    hasUser: !!user,
    authStatus: authState.status
  });
  

  // Check loading states
  const rolesLoading = authState.roles.loading;
  
  // Only show loading if we're actually waiting for initial auth check
  // If we have a user and roles are loaded, we're not loading anymore
  const isActuallyLoading = loading && !user;
  
  if (isActuallyLoading) {
    console.log('🔐 ProtectedRoute: Loading initial auth...', { sessionLoading: loading, rolesLoading, user: !!user });
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If user is not authenticated, redirect to sign in
  if (!user) {
    console.log('🔐 ProtectedRoute: No user, redirecting to signin');
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If specific roles are required, check if user has at least one of them
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRole) {
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles (if any)
  return <>{children}</>;
}