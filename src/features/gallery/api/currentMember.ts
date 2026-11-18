import { supabase } from '@/lib/supabase';

export interface CurrentMember {
  /** auth.users id: storage folders are keyed on this. */
  userId: string;
  /** members.id: user_id on galleries, photos, likes and comments references this. */
  memberId: string;
}

/**
 * The signed-in user and their member row. Gallery tables store the member id
 * in user_id, so writes and ownership filters must use memberId, not the auth id.
 */
export async function requireCurrentMember(): Promise<CurrentMember> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: member, error } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!member) throw new Error('User does not have a member profile');

  return { userId: user.id, memberId: member.id };
}
