// Test Supabase connection and RLS policies
// Run this with: npx tsx test-supabase-connection.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opkqtpmmtvprhfyjmkhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...\n');

  // Test 1: Companies table
  console.log('1. Testing companies table:');
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('*')
    .limit(5);
  
  if (companiesError) {
    console.error('❌ Companies error:', companiesError);
  } else {
    console.log('✅ Companies query successful. Found', companies?.length || 0, 'companies');
  }

  // Test 2: Events table
  console.log('\n2. Testing events table:');
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .limit(5);
  
  if (eventsError) {
    console.error('❌ Events error:', eventsError);
  } else {
    console.log('✅ Events query successful. Found', events?.length || 0, 'published events');
  }

  // Test 3: Groups table
  console.log('\n3. Testing groups table:');
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .in('visibility', ['open', 'closed'])
    .eq('status', 'published')
    .limit(5);
  
  if (groupsError) {
    console.error('❌ Groups error:', groupsError);
  } else {
    console.log('✅ Groups query successful. Found', groups?.length || 0, 'published groups');
  }

  // Test 4: Check if tables exist
  console.log('\n4. Checking if tables exist:');
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['companies', 'events', 'groups']);
  
  if (tablesError) {
    console.error('❌ Cannot query table information:', tablesError);
  } else {
    console.log('✅ Found tables:', tables?.map(t => t.table_name).join(', '));
  }
}

testConnection().catch(console.error);