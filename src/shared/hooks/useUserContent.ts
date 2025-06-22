import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface UserGroup {
  id: string;
  name: string;
  slug: string;
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
          throw new Error('Could not find member profile');
        }

        // Get groups where user is a member
        const { data: groupMemberships, error: groupsError } = await supabase
          .from('group_members')
          .select(`
            group:groups (
              id,
              name,
              slug,
              member_count
            )
          `)
          .eq('member_id', member.id)
          .eq('status', 'active');

        if (groupsError) {
          throw groupsError;
        }

        const userGroups = groupMemberships
          ?.map(membership => membership.group)
          .filter(Boolean) as UserGroup[];

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
          throw new Error('Could not find member profile');
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
          throw new Error('Could not find member profile');
        }

        // Get marketplace items created by user
        const { data: userItems, error: itemsError } = await supabase
          .from('marketplace_listings')
          .select('id, title, price, condition, images')
          .eq('seller_id', member.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(5);

        if (itemsError) {
          throw itemsError;
        }

        setItems(userItems || []);
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