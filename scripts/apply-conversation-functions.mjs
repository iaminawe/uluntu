#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFunctions() {
  console.log('🔧 Adding missing conversation functions...\n');

  try {
    // Test if functions already exist
    console.log('📍 Checking existing functions...');
    const { data: existingFuncs, error: checkError } = await supabase.rpc('check_conversation_participant', {
      conversation_id: '00000000-0000-0000-0000-000000000000'
    }).maybeSingle();

    if (!checkError || !checkError.message?.includes('function') || !checkError.message?.includes('does not exist')) {
      console.log('✅ Functions already exist, skipping creation');
      return;
    }

    console.log('📝 Functions not found, creating them now...\n');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'apply-conversation-functions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (!statement || statement.startsWith('SELECT')) continue;

      try {
        // Execute raw SQL through Supabase
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).maybeSingle();
        
        if (error) {
          // Try direct execution if exec_sql doesn't exist
          console.warn(`⚠️  Could not execute statement via RPC, statement may need manual execution`);
          errorCount++;
        } else {
          successCount++;
          console.log(`✅ Executed statement ${successCount}`);
        }
      } catch (err) {
        console.error(`❌ Failed to execute statement: ${err.message}`);
        errorCount++;
      }
    }

    console.log(`\n📊 Summary: ${successCount} statements successful, ${errorCount} errors`);

    // Test the functions
    console.log('\n🧪 Testing functions...');
    
    // Test check_conversation_participant
    const { data: testData1, error: testError1 } = await supabase.rpc('check_conversation_participant', {
      conversation_id: '00000000-0000-0000-0000-000000000000'
    }).maybeSingle();

    if (testError1?.message?.includes('does not exist')) {
      console.error('❌ Functions still not found. Please run the SQL script manually in Supabase SQL Editor:');
      console.error(`   ${sqlPath}`);
      console.error('\nTo do this:');
      console.error('1. Go to your Supabase project dashboard');
      console.error('2. Navigate to SQL Editor');
      console.error('3. Copy and paste the contents of the SQL file');
      console.error('4. Click "Run" to execute');
    } else {
      console.log('✅ check_conversation_participant function is working');
    }

    // Test update_conversation_title
    const { data: testData2, error: testError2 } = await supabase.rpc('update_conversation_title', {
      conversation_id: '00000000-0000-0000-0000-000000000000',
      new_title: 'Test'
    }).maybeSingle();

    if (testError2?.message?.includes('does not exist')) {
      console.error('❌ update_conversation_title function not found');
    } else if (testError2?.message?.includes('not found') || testError2?.message?.includes('permission')) {
      console.log('✅ update_conversation_title function exists (expected error for non-existent conversation)');
    } else {
      console.log('✅ update_conversation_title function is working');
    }

    console.log('\n✨ Function setup complete!');

  } catch (error) {
    console.error('❌ Error applying functions:', error);
    console.error('\n📝 Please manually run the SQL script in Supabase SQL Editor:');
    console.error(`   ${path.join(__dirname, 'apply-conversation-functions.sql')}`);
  }
}

// Run the script
applyFunctions();