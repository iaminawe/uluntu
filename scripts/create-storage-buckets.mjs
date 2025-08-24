#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBuckets() {
  console.log('🚀 Creating storage buckets...\n');

  const buckets = [
    {
      id: 'content-images',
      name: 'content-images',
      public: true,
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    },
    {
      id: 'profile-images',
      name: 'profile-images',
      public: true,
      file_size_limit: 5242880, // 5MB
      allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    },
    {
      id: 'background-images',
      name: 'background-images',
      public: true,
      file_size_limit: 10485760, // 10MB
      allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    }
  ];

  for (const bucket of buckets) {
    try {
      // Check if bucket exists
      const { data: existingBucket, error: checkError } = await supabase.storage.getBucket(bucket.id);
      
      if (existingBucket) {
        console.log(`✅ Bucket '${bucket.id}' already exists`);
        continue;
      }

      // Create bucket
      const { data, error } = await supabase.storage.createBucket(bucket.id, {
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types
      });

      if (error) {
        if (error.message?.includes('already exists')) {
          console.log(`✅ Bucket '${bucket.id}' already exists`);
        } else {
          console.error(`❌ Error creating bucket '${bucket.id}':`, error.message);
        }
      } else {
        console.log(`✅ Created bucket '${bucket.id}'`);
      }
    } catch (err) {
      console.error(`❌ Error with bucket '${bucket.id}':`, err.message);
    }
  }

  console.log('\n✨ Storage bucket setup complete!');
}

// Run the script
createStorageBuckets().catch(console.error);