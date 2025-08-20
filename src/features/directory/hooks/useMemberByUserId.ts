import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useMemberByUserId(userId?: string) {
  return useQuery({
    queryKey: ['member-by-user-id', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          member_skills (
            skill,
            level
          ),
          member_topics (
            topic_id,
            topics (
              id,
              name,
              slug
            )
          ),
          company_members (
            company_id,
            role,
            verified,
            companies (
              id,
              name,
              slug,
              logo
            )
          ),
          group_members (
            group_id,
            role,
            status,
            groups (
              id,
              name,
              slug,
              hero_image
            )
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!userId,
    retry: 1,
    staleTime: 60000, // 1 minute
  });
}