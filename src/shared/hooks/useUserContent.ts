import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UserGroup {
  id: string;
  name: string;
  member_count: number;
}

interface UserResource {
  id: string;
  title: string;
  type: string;
  created_at: string;
}

interface UserMarketplaceItem {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
}

/**
 * Hook to fetch user's groups
 */
export function useUserGroups() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    const fetchUserGroups = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get member ID from user ID
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (memberError || !member) {
          // If member profile doesn't exist, return empty results instead of throwing
          console.warn('Member profile not found for user, returning empty results');
          setGroups([]);
          return;
        }

        // Get groups where user is a member - use separate queries to avoid join issues
        const { data: groupMemberships, error: groupsError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('member_id', member.id);

        if (groupsError) {
          throw groupsError;
        }

        let userGroups: UserGroup[] = [];
        
        if (groupMemberships && groupMemberships.length > 0) {
          const groupIds = groupMemberships.map(gm => gm.group_id);
          
          const { data: groups, error: groupsDataError } = await supabase
            .from('groups')
            .select('id, name, member_count')
            .in('id', groupIds);
            
          if (groupsDataError) {
            throw groupsDataError;
          }
          
          userGroups = groups || [];
        }

        setGroups(userGroups || []);
      } catch (err) {
        console.error('Error fetching user groups:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserGroups();
  }, [user]);

  return { groups, isLoading, error };
}

/**
 * Hook to fetch user's resources
 */
export function useUserResources() {
  const { user } = useAuth();
  const [resources, setResources] = useState<UserResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setResources([]);
      setIsLoading(false);
      return;
    }

    const fetchUserResources = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get member ID from user ID
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (memberError || !member) {
          // If member profile doesn't exist, return empty results instead of throwing
          console.warn('Member profile not found for user, returning empty results');
          setResources([]);
          return;
        }

        // Get resources created by user
        const { data: userResources, error: resourcesError } = await supabase
          .from('resources')
          .select('id, title, type, created_at')
          .eq('contributor_id', member.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5);

        if (resourcesError) {
          throw resourcesError;
        }

        setResources(userResources || []);
      } catch (err) {
        console.error('Error fetching user resources:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserResources();
  }, [user]);

  return { resources, isLoading, error };
}

/**
 * Hook to fetch user's marketplace items
 */
export function useUserMarketplaceItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<UserMarketplaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    const fetchUserMarketplaceItems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get member ID from user ID
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (memberError || !member) {
          // If member profile doesn't exist, return empty results instead of throwing
          console.warn('Member profile not found for user, returning empty results');
          setItems([]);
          return;
        }

        // Get marketplace items created by user (using resources table as marketplace data)
        const { data: userItems, error: itemsError } = await supabase
          .from('resources')
          .select('id, title, image, type, created_at')
          .eq('contributor_id', member.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5);

        if (itemsError) {
          throw itemsError;
        }

        // Transform resource data to marketplace item format
        const transformedItems = (userItems || []).map(item => ({
          id: item.id,
          title: item.title,
          price: 0, // Resources don't have prices
          condition: 'new' as const,
          images: item.image ? [item.image] : []
        }));
        
        setItems(transformedItems);
      } catch (err) {
        console.error('Error fetching user marketplace items:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserMarketplaceItems();
  }, [user]);

  return { items, isLoading, error };
}