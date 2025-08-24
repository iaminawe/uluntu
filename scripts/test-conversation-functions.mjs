#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create client with anon key (as the app would)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFunctions() {
  console.log('🧪 Testing conversation functions...\n');

  // Test 1: check_conversation_participant
  console.log('Test 1: check_conversation_participant');
  try {
    const { data, error } = await supabase.rpc('check_conversation_participant', {
      conversation_id: '00000000-0000-0000-0000-000000000000'
    });

    if (error) {
      console.error('❌ Error:', error);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log('✅ Function works, response:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  console.log('\nTest 2: update_conversation_title');
  try {
    const { data, error } = await supabase.rpc('update_conversation_title', {
      conversation_id: '00000000-0000-0000-0000-000000000000',
      new_title: 'Test Title'
    });

    if (error) {
      console.error('❌ Error:', error);
      console.error('   Code:', error.code);
      console.error('   Details:', error.details);
      console.error('   Hint:', error.hint);
    } else {
      console.log('✅ Function works, response:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Test 3: Check what functions are actually available
  console.log('\nTest 3: List available functions');
  try {
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('pronamespace', '2200') // public schema
      .in('proname', ['check_conversation_participant', 'update_conversation_title']);

    if (error) {
      console.error('❌ Could not query functions:', error);
    } else {
      console.log('📋 Found functions:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  // Test 4: Try raw SQL query
  console.log('\nTest 4: Direct SQL query for functions');
  const query = `
    SELECT 
      p.proname AS function_name,
      pg_get_function_identity_arguments(p.oid) AS arguments
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('update_conversation_title', 'check_conversation_participant');
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });
    
    if (error) {
      console.error('❌ Could not execute SQL:', error);
    } else {
      console.log('📋 Functions in database:', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

// Run tests
testFunctions();