// Test events after fixing group_members RLS
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opkqtpmmtvprhfyjmkhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testEventsAfterFix() {
  console.log('=== TESTING EVENTS AFTER RLS FIX ===\n');

  // Test the exact API query that was failing
  console.log('Testing API query with joins:');
  const { data: events, error } = await supabase
    .from('events')
    .select('*, event_sessions(*)')
    .eq('status', 'published')
    .order('date', { ascending: true });
  
  if (error) {
    console.error('❌ Still getting error:', error);
  } else {
    console.log(`✅ Success! Found ${events?.length || 0} events`);
    if (events && events.length > 0) {
      console.log('Events fetched:');
      events.forEach(event => {
        console.log(`- ${event.title} (${event.date})`);
      });
    }
  }

  // Test creating an event with a real organizer ID
  console.log('\nTesting event creation with real organizer:');
  
  // First get a real member ID
  const { data: members } = await supabase
    .from('members')
    .select('id, name')
    .limit(1);
  
  if (members && members.length > 0) {
    const organizerId = members[0].id;
    console.log(`Using organizer: ${members[0].name} (${organizerId})`);
    
    const testEvent = {
      title: 'Test Event Creation',
      description: 'Testing event creation after RLS fix',
      date: '2025-04-01T18:00:00',
      location: 'Test Location',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800',
      type: 'in-person',
      status: 'published',
      organizer_id: organizerId
    };

    const { data: newEvent, error: createError } = await supabase
      .from('events')
      .insert(testEvent)
      .select();

    if (createError) {
      console.error('❌ Error creating event:', createError);
    } else {
      console.log('✅ Event created successfully!');
      
      // Clean up
      if (newEvent && newEvent[0]) {
        await supabase.from('events').delete().eq('id', newEvent[0].id);
        console.log('🧹 Test event cleaned up');
      }
    }
  } else {
    console.log('❌ No members found to use as organizer');
  }
}

testEventsAfterFix().catch(console.error);