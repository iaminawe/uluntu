import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkEvents() {
  console.log('Checking events in database...\n');
  
  const { data, error } = await supabase
    .from('events')
    .select('id, title, slug, date, location')
    .order('date', { ascending: true })
    .limit(10);
  
  if (error) {
    console.error('Error fetching events:', error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log('No events found in database');
    return;
  }
  
  console.log(`Found ${data.length} events:\n`);
  data.forEach((event, index) => {
    console.log(`${index + 1}. ${event.title}`);
    console.log(`   ID: ${event.id}`);
    console.log(`   Slug: ${event.slug || '❌ NO SLUG'}`);
    console.log(`   Date: ${event.date}`);
    console.log(`   Location: ${event.location}`);
    console.log('');
  });
  
  // Check how many have slugs
  const withSlugs = data.filter(e => e.slug);
  console.log(`Summary: ${withSlugs.length}/${data.length} events have slugs`);
}

checkEvents().catch(console.error);