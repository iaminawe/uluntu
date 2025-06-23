#!/usr/bin/env tsx

/**
 * Script to assign the 'authenticated' role to a user
 * This is needed when a user exists but has no roles assigned
 */

import { adminRolesApi } from '../src/features/admin/api/roles.js';

const USER_ID = '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';
const USER_EMAIL = 'gregg@iaminawe.com';

async function assignAuthenticatedRole() {
  console.log(`🔧 Assigning 'authenticated' role to user: ${USER_EMAIL} (${USER_ID})`);
  
  try {
    // First, check current roles
    console.log('📋 Checking current roles...');
    const currentRoles = await adminRolesApi.getUserRoles(USER_ID);
    console.log('Current roles:', currentRoles.map(r => r.id));
    
    // Check if user already has authenticated role
    if (currentRoles.some(role => role.id === 'authenticated')) {
      console.log('✅ User already has authenticated role');
      return;
    }
    
    // Assign the authenticated role
    console.log('➕ Assigning authenticated role...');
    const success = await adminRolesApi.assignRole(USER_ID, 'authenticated');
    
    if (success) {
      console.log('✅ Successfully assigned authenticated role');
      
      // Verify the assignment
      console.log('🔍 Verifying role assignment...');
      const updatedRoles = await adminRolesApi.getUserRoles(USER_ID);
      console.log('Updated roles:', updatedRoles.map(r => r.id));
      
      if (updatedRoles.some(role => role.id === 'authenticated')) {
        console.log('✅ Role assignment verified successfully');
      } else {
        console.log('❌ Role assignment verification failed');
      }
    } else {
      console.log('❌ Failed to assign authenticated role');
    }
    
  } catch (error) {
    console.error('❌ Error assigning role:', error);
  }
}

// Run the script
assignAuthenticatedRole().then(() => {
  console.log('🏁 Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});