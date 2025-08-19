import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const UnifiedUsersDebug: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({
    members: null,
    users: null,
    userRoles: null,
    errors: []
  });

  const runDebugQueries = async () => {
    setLoading(true);
    const errors: string[] = [];
    
    try {
      // 1. Check members table
      console.log('Checking members table...');
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .limit(5);
      
      if (membersError) {
        errors.push(`Members query error: ${membersError.message}`);
        console.error('Members error:', membersError);
      }

      // 2. Check auth.users (through a profile or user_roles)
      console.log('Checking user_roles table...');
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .limit(5);
      
      if (rolesError) {
        errors.push(`User roles query error: ${rolesError.message}`);
        console.error('User roles error:', rolesError);
      }

      // 3. Try the join query used in UnifiedUsersPage
      console.log('Trying join query...');
      const { data: joinData, error: joinError } = await supabase
        .from('members')
        .select(`
          *,
          user:user_id (
            id,
            email,
            created_at,
            last_sign_in_at
          )
        `)
        .limit(5);
      
      if (joinError) {
        errors.push(`Join query error: ${joinError.message}`);
        console.error('Join error:', joinError);
      }

      // 4. Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        errors.push(`Current user error: ${userError.message}`);
      }

      // 5. Check if there's any data in public.users or profiles
      console.log('Checking for profiles table...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);
      
      if (profilesError) {
        // This is expected if profiles table doesn't exist
        console.log('Profiles table not found (this might be normal)');
      }

      setDebugInfo({
        currentUser: user,
        members: {
          count: membersData?.length || 0,
          sample: membersData?.slice(0, 2),
          error: membersError
        },
        userRoles: {
          count: rolesData?.length || 0,
          sample: rolesData?.slice(0, 2),
          error: rolesError
        },
        joinQuery: {
          count: joinData?.length || 0,
          sample: joinData?.slice(0, 2),
          error: joinError
        },
        profiles: {
          exists: !profilesError,
          count: profilesData?.length || 0,
          sample: profilesData?.slice(0, 2)
        },
        errors
      });

    } catch (error: any) {
      console.error('Debug error:', error);
      errors.push(`Unexpected error: ${error.message}`);
      setDebugInfo(prev => ({ ...prev, errors }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDebugQueries();
  }, []);

  const formatJson = (obj: any) => {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return 'Unable to format';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Unified Users Debug</h1>
            <button
              onClick={runDebugQueries}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Running...' : 'Refresh'}
            </button>
          </div>

          {debugInfo.errors.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                Errors Detected
              </h3>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {debugInfo.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Current User */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Current User</h2>
            <div className="bg-gray-50 rounded p-3">
              {debugInfo.currentUser ? (
                <div className="text-sm">
                  <p><strong>ID:</strong> {debugInfo.currentUser.id}</p>
                  <p><strong>Email:</strong> {debugInfo.currentUser.email}</p>
                </div>
              ) : (
                <p className="text-gray-500">No user logged in</p>
              )}
            </div>
          </div>

          {/* Members Table */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Members Table</h2>
            <div className="bg-gray-50 rounded p-3">
              {debugInfo.members ? (
                <>
                  <div className="mb-2 flex items-center">
                    {debugInfo.members.error ? (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <span className="text-sm">
                      Found {debugInfo.members.count} members
                    </span>
                  </div>
                  {debugInfo.members.sample && debugInfo.members.sample.length > 0 && (
                    <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                      {formatJson(debugInfo.members.sample)}
                    </pre>
                  )}
                  {debugInfo.members.error && (
                    <p className="text-sm text-red-600 mt-2">
                      Error: {debugInfo.members.error.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>

          {/* User Roles Table */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">User Roles Table</h2>
            <div className="bg-gray-50 rounded p-3">
              {debugInfo.userRoles ? (
                <>
                  <div className="mb-2 flex items-center">
                    {debugInfo.userRoles.error ? (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <span className="text-sm">
                      Found {debugInfo.userRoles.count} role assignments
                    </span>
                  </div>
                  {debugInfo.userRoles.sample && debugInfo.userRoles.sample.length > 0 && (
                    <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                      {formatJson(debugInfo.userRoles.sample)}
                    </pre>
                  )}
                  {debugInfo.userRoles.error && (
                    <p className="text-sm text-red-600 mt-2">
                      Error: {debugInfo.userRoles.error.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>

          {/* Join Query Result */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Join Query (members with user)</h2>
            <div className="bg-gray-50 rounded p-3">
              {debugInfo.joinQuery ? (
                <>
                  <div className="mb-2 flex items-center">
                    {debugInfo.joinQuery.error ? (
                      <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <span className="text-sm">
                      Found {debugInfo.joinQuery.count} results
                    </span>
                  </div>
                  {debugInfo.joinQuery.sample && debugInfo.joinQuery.sample.length > 0 && (
                    <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                      {formatJson(debugInfo.joinQuery.sample)}
                    </pre>
                  )}
                  {debugInfo.joinQuery.error && (
                    <p className="text-sm text-red-600 mt-2">
                      Error: {debugInfo.joinQuery.error.message}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>

          {/* Profiles Table Check */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Profiles Table</h2>
            <div className="bg-gray-50 rounded p-3">
              {debugInfo.profiles ? (
                <>
                  <div className="mb-2 flex items-center">
                    {debugInfo.profiles.exists ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                    )}
                    <span className="text-sm">
                      {debugInfo.profiles.exists 
                        ? `Table exists with ${debugInfo.profiles.count} profiles`
                        : 'Table not found (using members table instead)'}
                    </span>
                  </div>
                  {debugInfo.profiles.sample && debugInfo.profiles.sample.length > 0 && (
                    <pre className="text-xs bg-gray-900 text-gray-100 p-2 rounded overflow-x-auto">
                      {formatJson(debugInfo.profiles.sample)}
                    </pre>
                  )}
                </>
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Debug Recommendations
            </h3>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Check if the members table has data</li>
              <li>Verify that user_id in members table matches auth.users IDs</li>
              <li>Ensure RLS policies allow reading members data</li>
              <li>Consider using a simpler query without joins if the join is failing</li>
              <li>Check browser console for additional errors</li>
            </ol>
          </div>

          {/* SQL Queries to Try */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">SQL Queries to Debug in Supabase</h3>
            <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
{`-- Check members table
SELECT COUNT(*) FROM members;
SELECT * FROM members LIMIT 5;

-- Check if user_id references exist
SELECT m.*, u.email 
FROM members m
LEFT JOIN auth.users u ON m.user_id = u.id
LIMIT 5;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'members';

-- Insert test data if empty
INSERT INTO members (name, email, location, title, status, created_at, updated_at)
VALUES 
  ('Test User 1', 'test1@example.com', 'New York', 'Developer', 'published', NOW(), NOW()),
  ('Test User 2', 'test2@example.com', 'San Francisco', 'Designer', 'published', NOW(), NOW());`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedUsersDebug;