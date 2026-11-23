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
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Authentication required');
  }

  const { data: member, error } = await supabase.from('members').select('id').eq('user_id', user.id).maybeSingle();

  if (error) throw error;
  if (!member) throw new Error('User does not have a member profile');

  return { userId: user.id, memberId: member.id };
}

export interface GalleryOwner {
  /** members.id of the gallery's owner: new photos get this as user_id. */
  memberId: string;
  /** The owner's auth.users id, or null if the member has no login. */
  userId: string | null;
}

/**
 * The owner of a gallery. Photos belong to the gallery's owner even when a
 * site admin uploads them, so the owner can still edit and delete them.
 */
export async function getGalleryOwner(galleryId: string): Promise<GalleryOwner> {
  const { data: gallery, error } = await supabase
    .from('user_galleries')
    .select('user_id, owner:members!user_galleries_user_id_fkey(user_id)')
    .eq('id', galleryId)
    .single();

  if (error) throw error;
  if (!gallery?.user_id) throw new Error('Gallery not found');

  const owner = gallery.owner as { user_id: string | null } | null;
  return { memberId: gallery.user_id, userId: owner?.user_id ?? null };
}
