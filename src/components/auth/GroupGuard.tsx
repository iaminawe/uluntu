import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

interface GroupGuardProps {
  children: ReactNode;
}

/**
 * Component to handle group access permissions
 * Checks if the user has access to the group based on visibility and membership
 */
export default function GroupGuard({ children }: GroupGuardProps) {
  const { id } = useParams<{ id: string }>();
  const { user, loading, isAdmin } = useAuth();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkGroupAccess() {
      if (!id || loading) return;

      try {
        // If user is a superadmin, they always have access
        if (isAdmin) {
          setHasAccess(true);
          return;
        }

        // If user is not authenticated, they only have access to open/closed groups
        if (!user) {
          const { data: group } = await supabase
            .from('groups')
            .select('visibility')
            .eq('id', id)
            .single();

          setHasAccess(group?.visibility === 'open' || group?.visibility === 'closed');
          return;
        }

        // Get the member ID for the current user
        const { data: memberData } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!memberData) {
          setHasAccess(false);
          return;
        }

        // Check if the user is a member of the group
        const { data: membership } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', id)
          .eq('member_id', memberData.id)
          .single();

        if (membership) {
          // User is a member of the group
          setHasAccess(true);
          return;
        }

        // If not a member, check if the group is open or closed
        const { data: group } = await supabase
          .from('groups')
          .select('visibility')
          .eq('id', id)
          .single();

        setHasAccess(group?.visibility === 'open' || group?.visibility === 'closed');
      } catch (error) {
        console.error('Error checking group access:', error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkGroupAccess();
  }, [id, user, loading, isAdmin]);

  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}