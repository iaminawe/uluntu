import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useSession } from '@/shared/contexts/SessionContextWithRedux';
import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';
import { lookupContent } from '@/utils/contentUrlUtils';

interface GroupGuardProps {
  children: ReactNode;
}

/**
 * Component to handle group access permissions
 * Checks if the user has access to the group based on visibility and membership
 */
export default function GroupGuard({ children }: GroupGuardProps) {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading } = useSession();
  const authState = useAppSelector(state => state.auth);
  const userRoles = authState.roles.list;
  const isAdmin = userRoles.includes('admin') || userRoles.includes('superadmin');
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [groupId, setGroupId] = useState<string | null>(null);

  useEffect(() => {
    async function checkGroupAccess() {
      console.log('[GroupGuard] Checking access for group:', slug, { loading, user: !!user, isAdmin });
      
      if (!slug || loading) {
        console.log('[GroupGuard] Skipping check - no slug or still loading');
        return;
      }
      
      // First, resolve the slug to get the group ID
      const { data: group, foundBy } = await lookupContent('groups', slug, supabase);
      if (!group) {
        console.error('[GroupGuard] Group not found for slug:', slug);
        setHasAccess(false);
        setIsLoading(false);
        return;
      }
      
      const id = group.id;
      setGroupId(id);
      console.log('[GroupGuard] Resolved slug to ID:', slug, '->', id);

      try {
        // If user is a superadmin, they always have access
        if (isAdmin) {
          console.log('[GroupGuard] User is admin - granting access');
          setHasAccess(true);
          return;
        }

        // If user is not authenticated, they only have access to open/closed groups
        if (!user) {
          console.log('[GroupGuard] No user - checking group visibility');
          const { data: group } = await supabase
            .from('groups')
            .select('visibility')
            .eq('id', id)
            .single();

          const access = group?.visibility === 'open' || group?.visibility === 'closed';
          console.log('[GroupGuard] Group visibility:', group?.visibility, 'Access:', access);
          setHasAccess(access);
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
        console.error('[GroupGuard] Error checking group access:', error);
        setHasAccess(false);
      } finally {
        console.log('[GroupGuard] Check complete. hasAccess:', hasAccess);
        setIsLoading(false);
      }
    }

    checkGroupAccess();
  }, [slug, user, loading, isAdmin]);

  console.log('[GroupGuard] Render state:', { loading, isLoading, hasAccess });
  
  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (hasAccess === false) {
    console.log('[GroupGuard] Access denied - redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  if (hasAccess === true) {
    console.log('[GroupGuard] Access granted - rendering children');
    return <>{children}</>;
  }
  
  // This shouldn't happen, but just in case
  console.log('[GroupGuard] Unexpected state - hasAccess is null but not loading');
  return null;
}