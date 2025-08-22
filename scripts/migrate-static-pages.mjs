import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define static page content
const staticPages = [
  {
    title: 'Home',
    slug: 'home',
    is_system: true,
    is_featured: true,
    blocks: [
      { type: 'heading', content: 'Welcome to Nelson Tech Community' },
      { type: 'paragraph', content: 'Connect with the vibrant tech community in Nelson, New Zealand. Join us for events, share knowledge, and grow your network.' },
      { type: 'heading', content: 'Upcoming Events' },
      { type: 'paragraph', content: 'Check out our latest tech meetups, workshops, and networking events.' },
      { type: 'heading', content: 'Community Features' },
      { type: 'bulletList', content: '🏢 Browse local tech companies' },
      { type: 'bulletList', content: '👥 Connect with professionals' },
      { type: 'bulletList', content: '📚 Share resources and knowledge' },
      { type: 'bulletList', content: '🎯 Find job opportunities' },
      { type: 'bulletList', content: '🚀 Showcase your projects' },
      { type: 'heading', content: 'Join Our Community' },
      { type: 'paragraph', content: 'Whether you\'re a developer, designer, entrepreneur, or tech enthusiast, there\'s a place for you in Nelson Tech.' }
    ],
    meta_title: 'Nelson Tech Community - Connect, Learn, Grow',
    meta_description: 'Join Nelson\'s thriving tech community. Connect with professionals, discover events, and grow your career in New Zealand\'s sunshine capital.'
  },
  {
    title: 'About Us',
    slug: 'about',
    is_system: true,
    blocks: [
      { type: 'heading', content: 'About Nelson Tech Community' },
      { type: 'paragraph', content: 'Nelson Tech is a community-driven platform that connects technology professionals, companies, and enthusiasts in the Nelson-Tasman region.' },
      { type: 'heading', content: 'Our Mission' },
      { type: 'paragraph', content: 'To foster innovation, collaboration, and growth in Nelson\'s technology ecosystem by providing a central hub for networking, knowledge sharing, and professional development.' },
      { type: 'heading', content: 'What We Do' },
      { type: 'bulletList', content: 'Host regular tech meetups and workshops' },
      { type: 'bulletList', content: 'Connect local tech professionals and companies' },
      { type: 'bulletList', content: 'Provide a platform for sharing resources and knowledge' },
      { type: 'bulletList', content: 'Support tech education and career development' },
      { type: 'bulletList', content: 'Promote Nelson as a destination for tech talent' },
      { type: 'heading', content: 'Our Values' },
      { type: 'bulletList', content: '🤝 Community First - We believe in the power of collaboration' },
      { type: 'bulletList', content: '📚 Knowledge Sharing - Learning and teaching go hand in hand' },
      { type: 'bulletList', content: '🌱 Growth Mindset - Always evolving and improving' },
      { type: 'bulletList', content: '🎯 Inclusivity - Tech is for everyone' },
      { type: 'bulletList', content: '✨ Innovation - Embracing new ideas and technologies' },
      { type: 'heading', content: 'Get Involved' },
      { type: 'paragraph', content: 'Join us in building Nelson\'s tech future. Whether you want to attend events, share your expertise, or connect with like-minded professionals, we welcome you to our community.' }
    ],
    meta_title: 'About Nelson Tech Community',
    meta_description: 'Learn about Nelson Tech Community\'s mission to connect and grow the technology ecosystem in Nelson, New Zealand.'
  }
];

async function migrateStaticPages() {
  console.log('🚀 Starting static pages migration...\n');

  for (const pageData of staticPages) {
    try {
      console.log(`📄 Processing: ${pageData.title} (/${pageData.slug})`);

      // Check if page already exists
      const { data: existingPage } = await supabase
        .from('pages')
        .select('id, title')
        .eq('slug', pageData.slug)
        .single();

      if (existingPage) {
        console.log(`   ⏭️  Page already exists, updating...`);
        
        // Update existing page
        const { error: updateError } = await supabase
          .from('pages')
          .update({
            blocks: pageData.blocks,
            is_system: pageData.is_system,
            is_featured: pageData.is_featured,
            meta_title: pageData.meta_title,
            meta_description: pageData.meta_description,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPage.id);

        if (updateError) {
          console.error(`   ❌ Error updating: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated successfully`);
        }
      } else {
        // Create new page
        const { error: createError } = await supabase
          .from('pages')
          .insert({
            ...pageData,
            page_type: 'block',
            status: 'published',
            published_at: new Date().toISOString(),
            is_editable: true,
            version: 1
          });

        if (createError) {
          console.error(`   ❌ Error creating: ${createError.message}`);
        } else {
          console.log(`   ✅ Created successfully`);
        }
      }
    } catch (error) {
      console.error(`   ❌ Unexpected error: ${error}`);
    }
  }

  console.log('\n✨ Migration complete!');
  console.log('\n📍 You can now view these pages at:');
  staticPages.forEach(page => {
    console.log(`   http://localhost:5555/pages/${page.slug}`);
  });
}

// Run the migration
migrateStaticPages().then(() => process.exit(0));