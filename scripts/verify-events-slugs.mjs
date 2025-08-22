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

async function verifyEventsSlugs() {
  console.log('🔍 Verifying Events with Slugs\n');
  console.log('=' .repeat(60));
  
  // Fetch all events
  const { data: events, error } = await supabase
    .from('events')
    .select('id, title, slug, date, location, organizer_id')
    .order('date', { ascending: true });
  
  if (error) {
    console.error('❌ Error fetching events:', error);
    return;
  }
  
  if (!events || events.length === 0) {
    console.log('⚠️  No events found in database');
    return;
  }
  
  console.log(`✅ Found ${events.length} events in database\n`);
  
  // Check slug status
  const withSlugs = events.filter(e => e.slug);
  const withoutSlugs = events.filter(e => !e.slug);
  
  console.log('📊 Slug Status:');
  console.log(`   - With slugs: ${withSlugs.length}/${events.length} (${Math.round(withSlugs.length/events.length * 100)}%)`);
  console.log(`   - Without slugs: ${withoutSlugs.length}/${events.length}\n`);
  
  if (withoutSlugs.length > 0) {
    console.log('⚠️  Events without slugs:');
    withoutSlugs.forEach(event => {
      console.log(`   - ${event.title} (ID: ${event.id})`);
    });
    console.log('');
  }
  
  // Show sample URLs
  console.log('🔗 Sample Event URLs (using slugs):');
  withSlugs.slice(0, 5).forEach(event => {
    console.log(`   - /events/${event.slug}`);
    console.log(`     ${event.title}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log('✅ Verification Complete!');
  
  // Summary
  if (withSlugs.length === events.length) {
    console.log('🎉 All events have slugs and are ready for SEO-friendly URLs!');
  } else {
    console.log(`⚠️  ${withoutSlugs.length} events still need slugs for SEO-friendly URLs`);
  }
}

verifyEventsSlugs().catch(console.error);