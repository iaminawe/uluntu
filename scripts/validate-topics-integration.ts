#!/usr/bin/env ts-node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateTopicsIntegration() {
  console.log('🔍 Validating Topics Integration...\n');

  let errors = 0;
  let warnings = 0;

  // 1. Check if topics table exists
  console.log('1. Checking topics table...');
  try {
    const { data: topics, error } = await supabase.from('topics').select('*');
    if (error) throw error;
    
    console.log(`✅ Topics table exists with ${topics.length} topics`);
    
    // Check for seeded topics
    const expectedTopics = ['Technology', 'Business', 'Art', 'Photography', 'Design'];
    const topicNames = topics.map(t => t.name);
    
    for (const expected of expectedTopics) {
      if (topicNames.includes(expected)) {
        console.log(`   ✓ ${expected} topic found`);
      } else {
        console.log(`   ⚠️  ${expected} topic missing`);
        warnings++;
      }
    }
  } catch (error) {
    console.error('❌ Topics table not found or error:', error);
    errors++;
  }

  // 2. Check junction tables
  console.log('\n2. Checking junction tables...');
  const junctionTables = [
    { name: 'news_topics', entityField: 'news_id' },
    { name: 'event_topics', entityField: 'event_id' },
    { name: 'resource_topics', entityField: 'resource_id' },
    { name: 'group_topics', entityField: 'group_id' },
    { name: 'marketplace_topics', entityField: 'listing_id' },
    { name: 'opportunity_topics', entityField: 'opportunity_id' },
    { name: 'company_topics', entityField: 'company_id' }
  ];

  for (const table of junctionTables) {
    try {
      const { count, error } = await supabase
        .from(table.name)
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      console.log(`✅ ${table.name} exists (${count || 0} associations)`);
    } catch (error) {
      console.error(`❌ ${table.name} not found or error:`, error);
      errors++;
    }
  }

  // 3. Check topic_analytics view
  console.log('\n3. Checking topic_analytics view...');
  try {
    const { data: analytics, error } = await supabase
      .from('topic_analytics')
      .select('*');
    
    if (error) throw error;
    console.log(`✅ topic_analytics view exists`);
    
    if (analytics && analytics.length > 0) {
      console.log('\n   Topic Content Distribution:');
      analytics.forEach(stat => {
        console.log(`   - ${stat.topic_name}: ${stat.content_count} items`);
      });
    }
  } catch (error) {
    console.error('❌ topic_analytics view not found or error:', error);
    errors++;
  }

  // 4. Test topic slug generation
  console.log('\n4. Testing topic slug generation...');
  try {
    const { data: testTopic, error } = await supabase
      .from('topics')
      .insert({ name: 'Test Topic With Spaces!' })
      .select()
      .single();
    
    if (error) throw error;
    
    if (testTopic.slug === 'test-topic-with-spaces') {
      console.log('✅ Slug generation working correctly');
    } else {
      console.log(`⚠️  Slug generation issue: expected 'test-topic-with-spaces', got '${testTopic.slug}'`);
      warnings++;
    }
    
    // Clean up
    await supabase.from('topics').delete().eq('id', testTopic.id);
  } catch (error) {
    console.error('❌ Could not test slug generation:', error);
    errors++;
  }

  // 5. Test RLS policies
  console.log('\n5. Testing RLS policies...');
  try {
    // Test read access (should work with anon key)
    const { data, error } = await supabase.from('topics').select('*').limit(1);
    if (!error && data) {
      console.log('✅ Read access working (public access)');
    } else {
      throw error || new Error('No data returned');
    }
  } catch (error) {
    console.error('❌ RLS read policy issue:', error);
    errors++;
  }

  // 6. Check entity integration
  console.log('\n6. Checking entity integration...');
  const entities = ['news', 'events', 'resources', 'groups', 'marketplace_listings', 'opportunities', 'companies'];
  
  for (const entity of entities) {
    try {
      // Try to query entity with topics
      const { data, error } = await supabase
        .from(entity)
        .select('id')
        .limit(1);
      
      if (!error) {
        console.log(`✅ ${entity} table accessible`);
      } else {
        throw error;
      }
    } catch (error) {
      console.error(`⚠️  ${entity} table issue:`, error);
      warnings++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('VALIDATION SUMMARY:');
  console.log('='.repeat(50));
  
  if (errors === 0 && warnings === 0) {
    console.log('✅ All checks passed! Topics integration is ready.');
  } else {
    console.log(`Completed with ${errors} errors and ${warnings} warnings.`);
    
    if (errors > 0) {
      console.log('\n⚠️  Critical issues found. Please run the migration:');
      console.log('   npm run migrate:topics');
    }
  }
  
  console.log('\n');
  process.exit(errors > 0 ? 1 : 0);
}

// Run validation
validateTopicsIntegration().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});