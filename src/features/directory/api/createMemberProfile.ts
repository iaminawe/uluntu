import { supabase, handleSupabaseError } from '@/shared/api/client';
import { adaptMemberFromDatabase } from '../utils/memberAdapter';
import { Member } from '../types';

export interface MemberProfileInput {
  name: string;
  title?: string;
  bio?: string;
  location?: string;
  image?: string;
  intro?: string;
  company?: string;
  skills?: string[];
  interests?: string[];
  social?: {
    website?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
  user_id: string;
}

export async function createMemberProfile(memberData: MemberProfileInput): Promise<Member | null> {
  try {
    // Prepare the data for insertion - only include fields that exist in the database
    const insertData: any = {
      name: memberData.name,
      title: memberData.title || null,
      bio: memberData.bio || null,
      location: memberData.location || null,
      image: memberData.image || null,
      website: memberData.social?.website || null,
      company: memberData.company || null,
      // Store the full social object as JSON if any social links are provided
      social: (memberData.social?.linkedin || memberData.social?.twitter || memberData.social?.github) 
        ? memberData.social 
        : null,
      status: 'published',
      featured: false,
      user_id: memberData.user_id
    };
    
    // First attempt with all fields
    let { data, error } = await supabase
      .from('members')
      .insert(insertData)
      .select()
      .single();

    // If company or social columns don't exist, retry without them
    if (error && error.message && (error.message.includes('company') || error.message.includes('social'))) {
      console.log('Retrying without company/social fields...');
      delete insertData.company;
      delete insertData.social;
      
      const retryResult = await supabase
        .from('members')
        .insert(insertData)
        .select()
        .single();
        
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      handleSupabaseError(error, 'creating member profile');
      return null;
    }
    
    // Handle skills separately if provided
    if (data && memberData.skills && memberData.skills.length > 0) {
      // Insert skills into member_skills table
      const skillsData = memberData.skills.map(skill => ({
        member_id: data.id,
        skill: skill
      }));
      
      const { error: skillsError } = await supabase
        .from('member_skills')
        .insert(skillsData);
        
      if (skillsError) {
        console.error('Error inserting skills:', skillsError);
      }
    }
    
    // Handle interests separately if provided
    if (data && memberData.interests && memberData.interests.length > 0) {
      // Insert interests into member_interests table
      const interestsData = memberData.interests.map(interest => ({
        member_id: data.id,
        interest: interest
      }));
      
      const { error: interestsError } = await supabase
        .from('member_interests')
        .insert(interestsData);
        
      if (interestsError) {
        console.error('Error inserting interests:', interestsError);
      }
    }
    
    return data ? adaptMemberFromDatabase(data) : null;
  } catch (error) {
    handleSupabaseError(error, 'creating member profile');
    return null;
  }
}

export async function updateMemberProfile(id: string, memberData: Partial<MemberProfileInput>): Promise<Member | null> {
  try {
    // Prepare the update data
    const updateData: any = {};
    
    if (memberData.name !== undefined) updateData.name = memberData.name;
    if (memberData.title !== undefined) updateData.title = memberData.title || null;
    if (memberData.bio !== undefined) updateData.bio = memberData.bio || null;
    if (memberData.location !== undefined) updateData.location = memberData.location || null;
    if (memberData.image !== undefined) updateData.image = memberData.image || null;
    if (memberData.social?.website !== undefined) updateData.website = memberData.social.website || null;
    if (memberData.company !== undefined) updateData.company = memberData.company || null;
    
    // Store the full social object as JSON if any social links are provided
    if (memberData.social && (memberData.social.linkedin || memberData.social.twitter || memberData.social.github)) {
      updateData.social = memberData.social;
    }
    
    // First attempt with all fields
    let { data, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // If company or social columns don't exist, retry without them
    if (error && error.message && (error.message.includes('company') || error.message.includes('social'))) {
      console.log('Retrying without company/social fields...');
      delete updateData.company;
      delete updateData.social;
      
      const retryResult = await supabase
        .from('members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      handleSupabaseError(error, 'updating member profile');
      return null;
    }
    
    // Handle skills separately if provided
    if (data && memberData.skills !== undefined) {
      // First, delete existing skills
      const { error: deleteError } = await supabase
        .from('member_skills')
        .delete()
        .eq('member_id', id);
        
      if (deleteError) {
        console.error('Error deleting existing skills:', deleteError);
      }
      
      // Then insert new skills if any
      if (memberData.skills.length > 0) {
        const skillsData = memberData.skills.map(skill => ({
          member_id: id,
          skill: skill
        }));
        
        const { error: skillsError } = await supabase
          .from('member_skills')
          .insert(skillsData);
          
        if (skillsError) {
          console.error('Error inserting skills:', skillsError);
        }
      }
    }
    
    // Handle interests separately if provided
    if (data && memberData.interests !== undefined) {
      // First, delete existing interests
      const { error: deleteError } = await supabase
        .from('member_interests')
        .delete()
        .eq('member_id', id);
        
      if (deleteError) {
        console.error('Error deleting existing interests:', deleteError);
      }
      
      // Then insert new interests if any
      if (memberData.interests.length > 0) {
        const interestsData = memberData.interests.map(interest => ({
          member_id: id,
          interest: interest
        }));
        
        const { error: interestsError } = await supabase
          .from('member_interests')
          .insert(interestsData);
          
        if (interestsError) {
          console.error('Error inserting interests:', interestsError);
        }
      }
    }
    
    return data ? adaptMemberFromDatabase(data) : null;
  } catch (error) {
    handleSupabaseError(error, 'updating member profile');
    return null;
  }
}