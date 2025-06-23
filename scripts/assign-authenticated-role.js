/**
 * Script to assign the 'authenticated' role to a user
 * This is needed when a user exists but has no roles assigned
 * 
 * Run this in the browser console or as a node script
 */

const USER_ID = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';
const USER_EMAIL = 'gregg@iaminawe.com';

async function assignAuthenticatedRoleDirectly() {
  console.log(`🔧 Assigning 'authenticated' role to user: ${USER_EMAIL} (${USER_ID})`);
  
  try {
    // Import supabase - adjust the path as needed
    const { supabase } = await import('../src/lib/supabase.js');
    
    // First, check current roles
    console.log('📋 Checking current roles...');
    const { data: currentRoles, error: fetchError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', USER_ID);
    
    if (fetchError) {
      console.error('❌ Error fetching current roles:', fetchError);
      return;
    }
    
    console.log('Current roles:', currentRoles?.map(r => r.role) || []);
    
    // Check if user already has authenticated role
    if (currentRoles?.some(role => role.role === 'authenticated')) {
      console.log('✅ User already has authenticated role');
      return;
    }
    
    // Assign the authenticated role
    console.log('➕ Assigning authenticated role...');
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: USER_ID,
        role: 'authenticated'
      });
    
    if (insertError) {
      console.error('❌ Error assigning role:', insertError);
      return;
    }
    
    console.log('✅ Successfully assigned authenticated role');
    
    // Verify the assignment
    console.log('🔍 Verifying role assignment...');
    const { data: updatedRoles, error: verifyError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', USER_ID);
    
    if (verifyError) {
      console.error('❌ Error verifying roles:', verifyError);
      return;
    }
    
    console.log('Updated roles:', updatedRoles?.map(r => r.role) || []);
    
    if (updatedRoles?.some(role => role.role === 'authenticated')) {
      console.log('✅ Role assignment verified successfully');
    } else {
      console.log('❌ Role assignment verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error in script:', error);
  }
}

// Check if running in browser
if (typeof window !== 'undefined') {
  // Browser environment - add to window for easy access
  window.assignAuthenticatedRole = assignAuthenticatedRoleDirectly;
  console.log('🌐 Script loaded in browser. Run: assignAuthenticatedRole()');
} else {
  // Node environment - run directly
  assignAuthenticatedRoleDirectly().then(() => {
    console.log('🏁 Script completed');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
}