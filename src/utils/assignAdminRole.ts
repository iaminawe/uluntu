import { supabase } from '@/lib/supabase';

/**
 * Utility to assign admin role to the current user
 * Run this in the browser console after signing in
 */
export async function assignAdminRole() {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('No authenticated user found');
      return false;
    }

    console.log('Current user:', user.email, user.id);

    // Check existing roles
    const { data: existingRoles, error: fetchError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching existing roles:', fetchError);
      // Try to create the table if it doesn't exist
      console.log('Attempting to create user_roles table...');
      
      const { error: createTableError } = await supabase.rpc('create_member_profile' as any, {});
      if (createTableError) {
        console.error('Could not create table:', createTableError);
      }
    } else {
      console.log('Existing roles:', existingRoles);
    }

    // Try to insert admin role
    const { data: insertData, error: insertError } = await supabase
      .from('user_roles')
      .insert([
        { user_id: user.id, role: 'admin' },
        { user_id: user.id, role: 'superadmin' }
      ])
      .select();

    if (insertError) {
      if (insertError.code === '23505') {
        console.log('Admin role already exists for this user');
        // Try to update instead
        const { error: updateError } = await supabase
          .from('user_roles')
          .upsert([
            { user_id: user.id, role: 'admin' },
            { user_id: user.id, role: 'superadmin' }
          ])
          .select();
        
        if (updateError) {
          console.error('Error updating roles:', updateError);
          return false;
        }
      } else {
        console.error('Error inserting admin role:', insertError);
        return false;
      }
    }

    console.log('✅ Admin role assigned successfully!');
    console.log('Inserted roles:', insertData);
    
    // Verify the roles were added
    const { data: verifyRoles, error: verifyError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id);

    if (verifyError) {
      console.error('Error verifying roles:', verifyError);
    } else {
      console.log('Verified roles:', verifyRoles);
    }

    console.log('🔄 Please refresh the page to apply the new roles');
    return true;

  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).assignAdminRole = assignAdminRole;
}