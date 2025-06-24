import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { membersApi } from '@/features/directory/api/membersApi';
import { newsApi } from '@/features/news/api/newsApi';
import { eventsApi } from '@/features/events/api/eventsApi';
import { useMembersHybrid } from '@/features/directory/hooks/useMembersHybrid';
import { useEventsHybrid } from '@/features/events/hooks/useEventsHybrid';
import { useCompaniesHybrid } from '@/features/companies/hooks/useCompaniesHybrid';
import RoleDebugUtility from '@/components/RoleDebugUtility';

interface DirectData {
  supabaseMembers?: any;
  membersApi?: number;
  newsApi?: number;
  eventsApi?: number;
}

export default function DebugPage() {
  const [directData, setDirectData] = useState<DirectData>({});
  const [errors, setErrors] = useState<Record<string, any>>({});
  
  // Test hybrid hooks
  const { members, isLoading: membersLoading, error: membersError } = useMembersHybrid();
  const { events, isLoading: eventsLoading, error: eventsError } = useEventsHybrid();
  const { companies, isLoading: companiesLoading, error: companiesError } = useCompaniesHybrid();

  useEffect(() => {
    const testDirectConnections = async () => {
      console.log('=== Testing Direct Connections ===');
      
      // Test 1: Direct Supabase
      try {
        const { data: membersCount, error } = await supabase.from('members').select('count');
        if (error) throw error;
        setDirectData((prev: DirectData) => ({ ...prev, supabaseMembers: membersCount }));
        console.log('✅ Direct Supabase members:', membersCount);
      } catch (err) {
        console.error('❌ Direct Supabase error:', err);
        setErrors((prev: Record<string, any>) => ({ ...prev, supabase: err }));
      }

      // Test 2: Members API
      try {
        const members = await membersApi.getAll();
        setDirectData((prev: DirectData) => ({ ...prev, membersApi: members.length }));
        console.log('✅ Members API:', members.length, 'members');
      } catch (err) {
        console.error('❌ Members API error:', err);
        setErrors((prev: Record<string, any>) => ({ ...prev, membersApi: err }));
      }

      // Test 3: News API
      try {
        const news = await newsApi.getAll();
        setDirectData((prev: DirectData) => ({ ...prev, newsApi: news.length }));
        console.log('✅ News API:', news.length, 'articles');
      } catch (err) {
        console.error('❌ News API error:', err);
        setErrors((prev: Record<string, any>) => ({ ...prev, newsApi: err }));
      }

      // Test 4: Events API
      try {
        const events = await eventsApi.getAll();
        setDirectData((prev: DirectData) => ({ ...prev, eventsApi: events.length }));
        console.log('✅ Events API:', events.length, 'events');
      } catch (err) {
        console.error('❌ Events API error:', err);
        setErrors((prev: Record<string, any>) => ({ ...prev, eventsApi: err }));
      }
    };

    testDirectConnections();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Dashboard</h1>
      
      {/* Role Debug Section */}
      <div className="mb-8">
        <RoleDebugUtility />
      </div>
      
      <hr className="my-8" />
      
      <h2 className="text-xl font-bold mb-4">API & Data Debug</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Environment Info */}
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Environment</h2>
          <pre className="text-sm">
            {JSON.stringify({
              VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
              VITE_USE_SUPABASE: import.meta.env.VITE_USE_SUPABASE,
              hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
              mode: import.meta.env.MODE
            }, null, 2)}
          </pre>
        </div>

        {/* Direct API Results */}
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="font-bold mb-2">Direct API Calls</h2>
          <pre className="text-sm">
            {JSON.stringify(directData, null, 2)}
          </pre>
        </div>

        {/* Hybrid Hook Results */}
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-bold mb-2">Hybrid Hooks</h2>
          <div className="text-sm space-y-2">
            <div>Members: {membersLoading ? 'Loading...' : `${members.length} found`}</div>
            <div>Events: {eventsLoading ? 'Loading...' : `${events.length} found`}</div>
            <div>Companies: {companiesLoading ? 'Loading...' : `${companies.length} found`}</div>
          </div>
        </div>

        {/* Errors */}
        <div className="bg-red-100 p-4 rounded">
          <h2 className="font-bold mb-2">Errors</h2>
          <div className="text-sm space-y-2">
            {membersError && <div>Members Error: {membersError.message}</div>}
            {eventsError && <div>Events Error: {eventsError.message}</div>}
            {companiesError && <div>Companies Error: {companiesError.message}</div>}
            {Object.keys(errors).length > 0 && (
              <pre className="text-xs">
                {JSON.stringify(errors, null, 2)}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Sample Data */}
      <div className="mt-6 bg-gray-50 p-4 rounded">
        <h2 className="font-bold mb-2">Sample Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h3 className="font-semibold">First Member</h3>
            <pre>{JSON.stringify(members[0], null, 2)}</pre>
          </div>
          <div>
            <h3 className="font-semibold">First Event</h3>
            <pre>{JSON.stringify(events[0], null, 2)}</pre>
          </div>
          <div>
            <h3 className="font-semibold">First Company</h3>
            <pre>{JSON.stringify(companies[0], null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}