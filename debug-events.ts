// Debug events issues
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://opkqtpmmtvprhfyjmkhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wa3F0cG1tdHZwcmhmeWpta2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwMzk1NTAsImV4cCI6MjA2MzYxNTU1MH0.0AGpsyD0KCZrwKfOhPatw08Kf1XyVgMhQA6_Uj8l4aU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugEvents() {
  console.log('=== DEBUG EVENTS ===\n');

  // 1. Check if events table has any data at all
  console.log('1. Checking all events in database:');
  const { data: allEvents, error: allError } = await supabase
    .from('events')
    .select('*')
    .limit(10);
  
  if (allError) {
    console.error('❌ Error fetching all events:', allError);
  } else {
    console.log(`✅ Found ${allEvents?.length || 0} total events`);
    if (allEvents && allEvents.length > 0) {
      console.log('Sample event:', allEvents[0]);
      console.log('Event statuses:', allEvents.map(e => e.status));
    }
  }

  // 2. Check published events specifically
  console.log('\n2. Checking published events:');
  const { data: publishedEvents, error: publishedError } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'published')
    .limit(10);
  
  if (publishedError) {
    console.error('❌ Error fetching published events:', publishedError);
  } else {
    console.log(`✅ Found ${publishedEvents?.length || 0} published events`);
    if (publishedEvents && publishedEvents.length > 0) {
      console.log('Published events:', publishedEvents.map(e => ({
        id: e.id,
        title: e.title,
        date: e.date,
        status: e.status
      })));
    }
  }

  // 3. Test the exact query the API is making
  console.log('\n3. Testing the exact API query:');
  const { data: apiEvents, error: apiError } = await supabase
    .from('events')
    .select('*, event_sessions(*)')
    .eq('status', 'published')
    .order('date', { ascending: true });
  
  if (apiError) {
    console.error('❌ Error with API query:', apiError);
  } else {
    console.log(`✅ API query returned ${apiEvents?.length || 0} events`);
  }

  // 4. Check if event_sessions table exists
  console.log('\n4. Checking event_sessions table:');
  const { data: sessions, error: sessionsError } = await supabase
    .from('event_sessions')
    .select('*')
    .limit(1);
  
  if (sessionsError) {
    console.error('❌ Error accessing event_sessions:', sessionsError);
  } else {
    console.log('✅ event_sessions table accessible');
  }

  // 5. Test adding a new event
  console.log('\n5. Testing event creation:');
  const testEvent = {
    title: 'Test Event Debug',
    description: 'Test event for debugging',
    date: '2025-03-01T18:00:00',
    location: 'Test Location',
    image: 'https://example.com/test.jpg',
    type: 'in-person',
    status: 'published',
    organizer_id: 'test-organizer-id'
  };

  const { data: newEvent, error: createError } = await supabase
    .from('events')
    .insert(testEvent)
    .select();

  if (createError) {
    console.error('❌ Error creating event:', createError);
  } else {
    console.log('✅ Event created successfully:', newEvent);
    
    // Clean up the test event
    if (newEvent && newEvent[0]) {
      await supabase.from('events').delete().eq('id', newEvent[0].id);
      console.log('🧹 Test event cleaned up');
    }
  }
}

debugEvents().catch(console.error);