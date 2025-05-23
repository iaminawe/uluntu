import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
  allowUnauthenticated?: boolean;
}

/**
 * Component to handle authentication state and redirect accordingly
 * If allowUnauthenticated is true, it will allow both authenticated and unauthenticated users
 * Otherwise, it will redirect unauthenticated users to the sign-in page
 */
export default function AuthGuard({ children, allowUnauthenticated = false }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user && !allowUnauthenticated) {
    // Redirect to sign-in page, but save the current location so we can redirect back after sign-in
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}