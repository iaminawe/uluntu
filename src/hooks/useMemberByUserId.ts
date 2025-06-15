import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Member } from './useMemberQueries';

// Helper function to convert between API Member and our UI Member
function adaptMember(data: unknown): Member {
  // Cast to a record to safely access properties
  const member = data as Record<string, unknown>;
  
  // Parse social data from the database
  // The database stores social links as a JSON object in the social column
  let social: Record<string, string> | undefined;
  if (member.social && typeof member.social === 'object' && member.social !== null) {
    social = member.social as Record<string, string>;
  } else if (typeof member.website === 'string' && member.website) {
    // Fallback: if no social object but website exists, create social with website
    social = { website: member.website };
  }
  
  // Safe property access with type checking
  return {
    id: typeof member.id === 'string' ? member.id : String(member.id),
    name: typeof member.name === 'string' ? member.name : '',
    email: typeof member.email === 'string' ? member.email : undefined,
    bio: typeof member.bio === 'string' ? member.bio : undefined,
    image: typeof member.image === 'string' ? member.image : undefined,
    role: typeof member.title === 'string' ? member.title : 
          typeof member.role === 'string' ? member.role : undefined,
    skills: Array.isArray(member.skills) ? 
            (member.skills as unknown[]).filter(s => typeof s === 'string') as string[] : [],
    joinDate: typeof member.joinDate === 'string' ? member.joinDate :
              typeof member.joinedDate === 'string' ? member.joinedDate :
              typeof member.joined_date === 'string' ? member.joined_date : undefined,
    joinedDate: typeof member.joinedDate === 'string' ? member.joinedDate :
               typeof member.joined_date === 'string' ? member.joined_date :
               typeof member.joinDate === 'string' ? member.joinDate : undefined,
    created_at: typeof member.created_at === 'string' ? member.created_at : undefined,
    status: typeof member.status === 'string' ? member.status as any : undefined,
    featured: typeof member.featured === 'boolean' ? member.featured : undefined,
    // Include additional fields from the database
    title: typeof member.title === 'string' ? member.title : undefined,
    location: typeof member.location === 'string' ? member.location : undefined,
    intro: typeof member.intro === 'string' ? member.intro : undefined,
    website: typeof member.website === 'string' ? member.website : undefined,
    user_id: typeof member.user_id === 'string' ? member.user_id : undefined,
    // Add company and social fields for the form
    company: typeof member.company === 'string' ? member.company : undefined,
    social: social,
    interests: Array.isArray(member.interests) ? 
              (member.interests as unknown[]).filter(i => typeof i === 'string') as string[] : [],
  };
}

export function useMemberByUserId(userId?: string): UseQueryResult<Member | null, Error> {
  return useQuery<Member | null, Error>({
    queryKey: ['members', 'by-user-id', userId],
    queryFn: async () => {
      if (!userId) {
        console.log('useMemberByUserId: No userId provided');
        return null;
      }
      
      try {
        // Fetch member by user_id
        const { data, error } = await supabase
          .from('members')
          .select(`
            *,
            member_skills(skill),
            member_interests(interest)
          `)
          .eq('user_id', userId)
          .single();
          
        if (error) {
          // If no member found for this user, return null (not an error)
          if (error.code === 'PGRST116') {
            console.log('No member profile found for user:', userId);
            return null;
          }
          console.error('Error fetching member by user ID:', error);
          throw error;
        }
        
        // Transform member_skills and member_interests arrays
        const memberWithSkillsAndInterests = {
          ...data,
          skills: data.member_skills?.map((ms: any) => ms.skill) || [],
          interests: data.member_interests?.map((mi: any) => mi.interest) || []
        };
        
        const adaptedMember = adaptMember(memberWithSkillsAndInterests);
        
        return adaptedMember;
      } catch (error) {
        console.error(`Error fetching member with user ID ${userId}:`, error);
        throw error;
      }
    },
    enabled: !!userId
  });
}