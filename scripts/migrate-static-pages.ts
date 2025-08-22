#!/usr/bin/env node
/**
 * Migration script to convert static React pages to database-backed editable pages
 * This script extracts content from static page components and creates database entries
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for admin access

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Page content mappings - extracted from static pages
const staticPages = [
  {
    slug: 'home',
    title: 'Nelson Tech Community',
    page_type: 'visual',
    template_id: 'landing-page',
    meta_title: 'Nelson Tech Community - Connecting Kootenay Tech Professionals',
    meta_description: 'Join the thriving tech community in Nelson and the Kootenays. Connect with professionals, discover events, and explore opportunities.',
    is_system: true,
    is_featured: true,
    blocks: [
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Nelson Tech Community' }],
        props: { level: 1 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'Connecting tech professionals, entrepreneurs, and innovators in the heart of British Columbia's mountain paradise' 
        }]
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'Join our thriving community of developers, designers, entrepreneurs, and tech enthusiasts. Whether you're looking to network, find opportunities, or share knowledge, you've found your tribe.' 
        }]
      }
    ]
  },
  {
    slug: 'about',
    title: 'About Nelson Tech Community',
    page_type: 'block',
    template_id: 'about-page',
    meta_title: 'About Us - Nelson Tech Community',
    meta_description: 'Learn about the Nelson Tech Community, our mission, values, and how you can get involved in our growing technology ecosystem.',
    is_system: true,
    blocks: [
      {
        type: 'heading',
        content: [{ type: 'text', text: 'About Nelson Tech Community' }],
        props: { level: 1 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'The Nelson Tech Community is dedicated to fostering innovation, collaboration, and growth in the technology sector throughout the Nelson region.' 
        }]
      },
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Our Mission' }],
        props: { level: 2 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'We bring together developers, entrepreneurs, designers, and tech enthusiasts to share knowledge, build connections, and drive the future of technology in our community.' 
        }]
      },
      {
        type: 'heading',
        content: [{ type: 'text', text: 'What We Offer' }],
        props: { level: 2 }
      },
      {
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Professional networking and community building' }]
      },
      {
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Regular tech meetups and events' }]
      },
      {
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Job opportunities and career development' }]
      },
      {
        type: 'bulletListItem',
        content: [{ type: 'text', text: 'Knowledge sharing and mentorship' }]
      }
    ]
  },
  {
    slug: 'partners',
    title: 'Our Partners',
    page_type: 'block',
    template_id: 'blank',
    meta_title: 'Partners - Nelson Tech Community',
    meta_description: 'Meet our partners who support the Nelson Tech Community through funding, resources, education, and collaboration.',
    is_system: true,
    blocks: [
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Our Partners' }],
        props: { level: 1 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'The Nelson Tech Community thrives thanks to the support and collaboration of our amazing partners. Together, we're building a vibrant tech ecosystem in the Kootenays.' 
        }]
      },
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Platinum Partners' }],
        props: { level: 2 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'TechStart Nelson - Supporting tech startups and entrepreneurs in the Nelson region with funding, mentorship, and resources.' 
        }]
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'Selkirk College - Leading educational institution providing technology programs and workforce development in the Kootenays.' 
        }]
      }
    ]
  },
  {
    slug: 'contact',
    title: 'Contact Us',
    page_type: 'block',
    template_id: 'contact-page',
    meta_title: 'Contact - Nelson Tech Community',
    meta_description: 'Get in touch with the Nelson Tech Community. We'd love to hear from you!',
    is_system: true,
    blocks: [
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Contact Us' }],
        props: { level: 1 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'Have questions, suggestions, or want to get involved? We'd love to hear from you!' 
        }]
      },
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Get in Touch' }],
        props: { level: 2 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'Email: info@nelsontech.ca' 
        }]
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'Location: Nelson, British Columbia, Canada' 
        }]
      }
    ]
  },
  {
    slug: 'terms',
    title: 'Terms of Service',
    page_type: 'block',
    template_id: 'blank',
    meta_title: 'Terms of Service - Nelson Tech Community',
    meta_description: 'Terms of Service for the Nelson Tech Community platform.',
    is_system: true,
    blocks: [
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Terms of Service' }],
        props: { level: 1 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'By using the Nelson Tech Community platform, you agree to these terms of service.' 
        }]
      },
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Acceptance of Terms' }],
        props: { level: 2 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.' 
        }]
      }
    ]
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    page_type: 'block',
    template_id: 'blank',
    meta_title: 'Privacy Policy - Nelson Tech Community',
    meta_description: 'Privacy Policy for the Nelson Tech Community platform.',
    is_system: true,
    blocks: [
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Privacy Policy' }],
        props: { level: 1 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'Your privacy is important to us. This policy describes how we collect, use, and protect your information.' 
        }]
      },
      {
        type: 'heading',
        content: [{ type: 'text', text: 'Information We Collect' }],
        props: { level: 2 }
      },
      {
        type: 'paragraph',
        content: [{ 
          type: 'text', 
          text: 'We collect information you provide directly to us, such as when you create an account, submit a form, or contact us.' 
        }]
      }
    ]
  }
];

async function migrateStaticPages() {
  console.log('🚀 Starting static pages migration...\n');

  // Get admin user for author_id
  const { data: adminRole } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'superadmin')
    .single();

  if (!adminRole) {
    console.error('❌ No admin user found. Please ensure an admin exists.');
    return;
  }

  const { data: adminMember } = await supabase
    .from('members')
    .select('id')
    .eq('user_id', adminRole.user_id)
    .single();

  if (!adminMember) {
    console.error('❌ Admin member profile not found.');
    return;
  }

  const authorId = adminMember.id;
  console.log(`✅ Found admin member: ${authorId}\n`);

  // Process each static page
  for (const pageData of staticPages) {
    console.log(`📄 Processing: ${pageData.title}`);

    try {
      // Check if page already exists
      const { data: existingPage } = await supabase
        .from('pages')
        .select('id, slug, is_system')
        .eq('slug', pageData.slug)
        .single();

      if (existingPage) {
        console.log(`  ⚠️  Page already exists: ${pageData.slug}`);
        
        // Update if not a system page or if we want to refresh content
        if (!existingPage.is_system) {
          const { error: updateError } = await supabase
            .from('pages')
            .update({
              blocks: JSON.stringify(pageData.blocks),
              page_type: pageData.page_type,
              template_id: pageData.template_id,
              meta_title: pageData.meta_title,
              meta_description: pageData.meta_description,
              is_system: pageData.is_system,
              is_featured: pageData.is_featured || false,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingPage.id);

          if (updateError) {
            console.error(`  ❌ Failed to update: ${updateError.message}`);
          } else {
            console.log(`  ✅ Updated existing page`);
          }
        }
      } else {
        // Create new page
        const { error: insertError } = await supabase
          .from('pages')
          .insert({
            slug: pageData.slug,
            title: pageData.title,
            blocks: JSON.stringify(pageData.blocks),
            page_type: pageData.page_type,
            template_id: pageData.template_id,
            meta_title: pageData.meta_title,
            meta_description: pageData.meta_description,
            is_system: pageData.is_system,
            is_featured: pageData.is_featured || false,
            is_editable: true,
            status: 'published',
            author_id: authorId,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error(`  ❌ Failed to create: ${insertError.message}`);
        } else {
          console.log(`  ✅ Created new page`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${pageData.slug}:`, error);
    }
  }

  console.log('\n✨ Migration completed!');
  console.log('\nNext steps:');
  console.log('1. Update routes to use EditablePageDisplay component');
  console.log('2. Test edit functionality with admin account');
  console.log('3. Customize page templates as needed');
}

// Run migration
migrateStaticPages()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });