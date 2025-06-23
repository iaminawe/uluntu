import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { adminRolesApi } from '@/features/admin/api/roles';
import { useAppSelector } from '@/store/hooks';

export default function RoleDebugUtility() {
  const [debugOutput, setDebugOutput] = useState<string>('');
  const { user } = useAppSelector(state => state.auth);
  const userId = user?.id || '54fd6d34-5d30-4ad0-9c53-fc24aa0412b8';

  const addToOutput = (message: string) => {
    setDebugOutput(prev => prev + '\n' + message);
  };

  const clearOutput = () => {
    setDebugOutput('');
  };

  const debugUserRoles = async () => {
    clearOutput();
    addToOutput(`🔍 Debugging roles for user: ${userId}`);
    addToOutput(`📧 User email: ${user?.email || 'gregg@iaminawe.com'}`);
    addToOutput('');

    try {
      // 1. Check if user_roles table exists and what data is there
      addToOutput('1️⃣ Checking user_roles table...');
      const { data: userRolesData, error: userRolesError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (userRolesError) {
        addToOutput(`❌ Error querying user_roles: ${userRolesError.message}`);
        addToOutput(`   Code: ${userRolesError.code}`);
      } else {
        addToOutput(`✅ user_roles query successful`);
        addToOutput(`   Found ${userRolesData?.length || 0} roles`);
        if (userRolesData && userRolesData.length > 0) {
          userRolesData.forEach((role, index) => {
            addToOutput(`   ${index + 1}. Role: "${role.role}"`);
          });
        } else {
          addToOutput('   No roles found in user_roles table');
        }
      }
      addToOutput('');

      // 2. Check if custom_roles table exists
      addToOutput('2️⃣ Checking custom_roles table...');
      const { data: customRolesData, error: customRolesError } = await supabase
        .from('custom_roles')
        .select('*')
        .limit(5);

      if (customRolesError) {
        addToOutput(`❌ Error querying custom_roles: ${customRolesError.message}`);
        addToOutput(`   Code: ${customRolesError.code}`);
      } else {
        addToOutput(`✅ custom_roles table exists`);
        addToOutput(`   Found ${customRolesData?.length || 0} custom roles`);
      }
      addToOutput('');

      // 3. Check user_custom_roles table
      addToOutput('3️⃣ Checking user_custom_roles table...');
      const { data: userCustomRolesData, error: userCustomRolesError } = await supabase
        .from('user_custom_roles')
        .select('*')
        .eq('user_id', userId);

      if (userCustomRolesError) {
        addToOutput(`❌ Error querying user_custom_roles: ${userCustomRolesError.message}`);
        addToOutput(`   Code: ${userCustomRolesError.code}`);
      } else {
        addToOutput(`✅ user_custom_roles query successful`);
        addToOutput(`   Found ${userCustomRolesData?.length || 0} custom role assignments`);
      }
      addToOutput('');

      // 4. Test the adminRolesApi.getUserRoles function
      addToOutput('4️⃣ Testing adminRolesApi.getUserRoles...');
      try {
        const apiRoles = await adminRolesApi.getUserRoles(userId);
        addToOutput(`✅ API call successful`);
        addToOutput(`   Returned ${apiRoles.length} roles`);
        if (apiRoles.length > 0) {
          apiRoles.forEach((role, index) => {
            addToOutput(`   ${index + 1}. ID: "${role.id}", Name: "${role.name}", Type: ${role.type}`);
          });
        } else {
          addToOutput('   No roles returned by API');
        }
      } catch (apiError) {
        addToOutput(`❌ API call failed: ${apiError}`);
      }
      addToOutput('');

      // 5. Check auth.users table for this user
      addToOutput('5️⃣ Checking auth.users table...');
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      if (authError) {
        addToOutput(`❌ Error getting current user: ${authError.message}`);
      } else {
        addToOutput(`✅ Current authenticated user:`);
        addToOutput(`   ID: ${authUser.user?.id}`);
        addToOutput(`   Email: ${authUser.user?.email}`);
        addToOutput(`   Matches expected ID: ${authUser.user?.id === userId}`);
      }

    } catch (error) {
      addToOutput(`💥 Unexpected error: ${error}`);
    }
  };

  const insertTestRole = async () => {
    addToOutput('\n🔧 Attempting to insert authenticated role...');
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'authenticated'
        })
        .select();

      if (error) {
        addToOutput(`❌ Insert failed: ${error.message}`);
        addToOutput(`   Code: ${error.code}`);
      } else {
        addToOutput(`✅ Insert successful!`);
        addToOutput(`   Inserted role: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addToOutput(`💥 Insert error: ${error}`);
    }
  };

  const insertAdminRole = async () => {
    addToOutput('\n🔧 Attempting to insert admin role...');
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'admin'
        })
        .select();

      if (error) {
        addToOutput(`❌ Insert failed: ${error.message}`);
        addToOutput(`   Code: ${error.code}`);
      } else {
        addToOutput(`✅ Insert successful!`);
        addToOutput(`   Inserted role: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      addToOutput(`💥 Insert error: ${error}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Role Debug Utility</h1>
      
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={debugUserRoles}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🔍 Debug User Roles
          </button>
          <button
            onClick={insertTestRole}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            ➕ Insert 'authenticated' Role
          </button>
          <button
            onClick={insertAdminRole}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            👑 Insert 'admin' Role
          </button>
          <button
            onClick={clearOutput}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            🗑️ Clear Output
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap h-96 overflow-y-auto">
          {debugOutput || 'Click "Debug User Roles" to start debugging...'}
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
        <h3 className="font-semibold text-yellow-800">Current User Info:</h3>
        <p className="text-yellow-700">
          User ID: {userId}<br/>
          Email: {user?.email || 'gregg@iaminawe.com'}<br/>
          Redux Roles: {JSON.stringify(useAppSelector(state => state.auth.roles.list))}
        </p>
      </div>
    </div>
  );
}