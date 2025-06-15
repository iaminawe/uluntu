// Check what data exists in the database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opkqtpmmtvprhfyjmkhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  console.log('Checking data in all tables...\n');

  // Check companies (no status filter)
  const { data: allCompanies, error: companiesError } = await supabase
    .from('companies')
    .select('id, name, status')
    .limit(10);
  
  console.log('Companies:');
  if (companiesError) {
    console.error('Error:', companiesError);
  } else {
    console.log('Total found:', allCompanies?.length || 0);
    if (allCompanies && allCompanies.length > 0) {
      console.log('Sample:', allCompanies.slice(0, 3));
    }
  }

  // Check events (all statuses)
  const { data: allEvents, error: eventsError } = await supabase
    .from('events')
    .select('id, title, status')
    .limit(10);
  
  console.log('\nEvents:');
  if (eventsError) {
    console.error('Error:', eventsError);
  } else {
    console.log('Total found:', allEvents?.length || 0);
    if (allEvents && allEvents.length > 0) {
      console.log('Sample:', allEvents.slice(0, 3));
      // Check status distribution
      const statuses = allEvents.map(e => e.status);
      const uniqueStatuses = [...new Set(statuses)];
      console.log('Status values found:', uniqueStatuses);
    }
  }

  // Check groups (all statuses)
  const { data: allGroups, error: groupsError } = await supabase
    .from('groups')
    .select('id, name, status, visibility')
    .limit(10);
  
  console.log('\nGroups:');
  if (groupsError) {
    console.error('Error:', groupsError);
  } else {
    console.log('Total found:', allGroups?.length || 0);
    if (allGroups && allGroups.length > 0) {
      console.log('Sample:', allGroups.slice(0, 3));
    }
  }

  // Check members
  const { data: members, error: membersError } = await supabase
    .from('members')
    .select('id, name, status')
    .limit(10);
  
  console.log('\nMembers:');
  if (membersError) {
    console.error('Error:', membersError);
  } else {
    console.log('Total found:', members?.length || 0);
    if (members && members.length > 0) {
      console.log('Sample:', members.slice(0, 3));
    }
  }
}

checkData().catch(console.error);