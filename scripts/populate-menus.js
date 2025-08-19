#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateMenuItems() {
  try {
    console.log('🚀 Starting menu population...');
    
    // Read the SQL file
    const sqlContent = readFileSync(join(__dirname, '..', 'sql-to-run', '17-fix-final-issues.sql'), 'utf-8');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      // If exec_sql doesn't exist, try running queries directly
      console.log('exec_sql not available, running queries directly...');
      
      // First check if menu items already exist
      const { data: existingItems, error: checkError } = await supabase
        .from('menu_items')
        .select('id')
        .limit(1);
      
      if (checkError) {
        console.error('Error checking existing items:', checkError);
      }
      
      if (existingItems && existingItems.length > 0) {
        console.log('⚠️  Menu items already exist. Skipping population.');
        
        // Show current menu structure
        const { data: containers } = await supabase
          .from('menu_containers')
          .select('id, name, title')
          .eq('is_active', true);
        
        console.log('\n📦 Active Containers:');
        for (const container of containers || []) {
          const { data: items } = await supabase
            .from('menu_items')
            .select('title, url, parent_id, sort_order')
            .eq('menu_container_id', container.id)
            .order('sort_order');
          
          console.log(`\n${container.title} (${container.name}): ${items?.length || 0} items`);
          
          // Show hierarchical structure
          const topLevel = items?.filter(item => !item.parent_id) || [];
          for (const parent of topLevel) {
            console.log(`  📁 ${parent.title} (${parent.url})`);
            const children = items?.filter(item => item.parent_id === parent.id) || [];
            for (const child of children) {
              console.log(`     └─ ${child.title} (${child.url})`);
            }
          }
        }
        
        return;
      }
      
      // Ensure containers exist
      console.log('📦 Creating menu containers...');
      const containers = [
        { name: 'main-navigation', type: 'main', title: 'Main Navigation', description: 'Primary site navigation menu', is_active: true },
        { name: 'footer-menu', type: 'footer', title: 'Footer Menu', description: 'Footer navigation links', is_active: true },
        { name: 'mobile-menu', type: 'mobile', title: 'Mobile Menu', description: 'Mobile navigation menu', is_active: true },
        { name: 'admin-menu', type: 'admin', title: 'Admin Menu', description: 'Administrative navigation menu', is_active: true }
      ];
      
      for (const container of containers) {
        const { error: containerError } = await supabase
          .from('menu_containers')
          .upsert(container, { onConflict: 'name' });
        
        if (containerError) {
          console.error(`Error creating container ${container.name}:`, containerError);
        }
      }
      
      // Get container IDs
      const { data: mainContainer } = await supabase
        .from('menu_containers')
        .select('id')
        .eq('name', 'main-navigation')
        .single();
      
      const { data: footerContainer } = await supabase
        .from('menu_containers')
        .select('id')
        .eq('name', 'footer-menu')
        .single();
      
      if (!mainContainer || !footerContainer) {
        console.error('Failed to get container IDs');
        return;
      }
      
      console.log('🎯 Populating main navigation...');
      
      // Main Navigation Items
      const mainNavItems = [];
      
      // Community (parent)
      const { data: communityParent } = await supabase
        .from('menu_items')
        .insert({
          menu_container_id: mainContainer.id,
          title: 'Community',
          url: '/community',
          sort_order: 100,
          is_enabled: true,
          is_visible: true,
          item_type: 'dropdown',
          icon: 'users'
        })
        .select('id')
        .single();
      
      // Community children
      if (communityParent) {
        const communityChildren = [
          { title: 'Events', url: '/events', description: 'Workshops, meetups, and tech talks', sort_order: 110, icon: 'calendar', custom_properties: { feature: 'events_system' } },
          { title: 'Directory', url: '/directory', description: 'Connect with tech professionals', sort_order: 120, icon: 'users', custom_properties: { feature: 'members_directory' } },
          { title: 'Groups', url: '/groups', description: 'Join communities of interest', sort_order: 130, icon: 'user-group', custom_properties: { feature: 'groups_communities' } },
          { title: 'News', url: '/news', description: 'Latest tech news and articles', sort_order: 140, icon: 'newspaper', custom_properties: { feature: 'news_blog' } },
          { title: 'Galleries', url: '/galleries', description: 'Browse community photo galleries', sort_order: 150, icon: 'photo', custom_properties: { feature: 'photo_galleries' } }
        ];
        
        for (const child of communityChildren) {
          await supabase.from('menu_items').insert({
            menu_container_id: mainContainer.id,
            parent_id: communityParent.id,
            ...child,
            is_enabled: true,
            is_visible: true,
            item_type: 'link'
          });
        }
      }
      
      // Business (parent)
      const { data: businessParent } = await supabase
        .from('menu_items')
        .insert({
          menu_container_id: mainContainer.id,
          title: 'Business',
          url: '/business',
          sort_order: 200,
          is_enabled: true,
          is_visible: true,
          item_type: 'dropdown',
          icon: 'briefcase'
        })
        .select('id')
        .single();
      
      // Business children
      if (businessParent) {
        const businessChildren = [
          { title: 'Companies', url: '/companies', description: 'Explore local tech companies', sort_order: 210, icon: 'building', custom_properties: { feature: 'companies_listing' } },
          { title: 'Opportunities', url: '/opportunities', description: 'Find jobs and volunteer roles', sort_order: 220, icon: 'briefcase', custom_properties: { feature: 'opportunities_board' } },
          { title: 'Marketplace', url: '/marketplace', description: 'Buy and sell tech items', sort_order: 230, icon: 'shopping-bag', custom_properties: { feature: 'marketplace' } }
        ];
        
        for (const child of businessChildren) {
          await supabase.from('menu_items').insert({
            menu_container_id: mainContainer.id,
            parent_id: businessParent.id,
            ...child,
            is_enabled: true,
            is_visible: true,
            item_type: 'link'
          });
        }
      }
      
      // Resources (standalone)
      await supabase.from('menu_items').insert({
        menu_container_id: mainContainer.id,
        title: 'Resources',
        url: '/resources',
        description: 'Educational content and guides',
        sort_order: 300,
        is_enabled: true,
        is_visible: true,
        item_type: 'link',
        icon: 'book-open',
        custom_properties: { feature: 'resources_library' }
      });
      
      // Topics (standalone)
      await supabase.from('menu_items').insert({
        menu_container_id: mainContainer.id,
        title: 'Topics',
        url: '/topics',
        description: 'Browse content by topic',
        sort_order: 400,
        is_enabled: true,
        is_visible: true,
        item_type: 'link',
        icon: 'tag'
      });
      
      // About (parent)
      const { data: aboutParent } = await supabase
        .from('menu_items')
        .insert({
          menu_container_id: mainContainer.id,
          title: 'About',
          url: '/about',
          sort_order: 500,
          is_enabled: true,
          is_visible: true,
          item_type: 'dropdown',
          icon: 'info'
        })
        .select('id')
        .single();
      
      // About children
      if (aboutParent) {
        const aboutChildren = [
          { title: 'About Us', url: '/about', description: 'Learn about our mission', sort_order: 510, icon: 'info' },
          { title: 'About Uluntu', url: '/about-uluntu', description: 'Learn about the Uluntu platform', sort_order: 520, icon: 'globe' },
          { title: 'Partners', url: '/partners', description: 'Our community partners and sponsors', sort_order: 530, icon: 'handshake' },
          { title: 'Contact', url: '/contact', description: 'Get in touch with us', sort_order: 540, icon: 'mail' },
          { title: 'Privacy', url: '/privacy', description: 'Privacy policy and data protection', sort_order: 550, icon: 'shield' },
          { title: 'Terms', url: '/terms', description: 'Terms of service and guidelines', sort_order: 560, icon: 'file-text' }
        ];
        
        for (const child of aboutChildren) {
          await supabase.from('menu_items').insert({
            menu_container_id: mainContainer.id,
            parent_id: aboutParent.id,
            ...child,
            is_enabled: true,
            is_visible: true,
            item_type: 'link'
          });
        }
      }
      
      console.log('🦶 Populating footer navigation...');
      
      // Footer Navigation (flat structure)
      const footerItems = [
        { title: 'Community', url: '/community', sort_order: 100 },
        { title: 'Directory', url: '/directory', sort_order: 200 },
        { title: 'Companies', url: '/companies', sort_order: 300 },
        { title: 'Groups', url: '/groups', sort_order: 400 },
        { title: 'Resources', url: '/resources', sort_order: 500 },
        { title: 'Events', url: '/events', sort_order: 600 },
        { title: 'News', url: '/news', sort_order: 700 },
        { title: 'About', url: '/about', sort_order: 800 },
        { title: 'Contact', url: '/contact', sort_order: 900 },
        { title: 'Privacy', url: '/privacy', sort_order: 1000 },
        { title: 'Terms', url: '/terms', sort_order: 1100 }
      ];
      
      for (const item of footerItems) {
        await supabase.from('menu_items').insert({
          menu_container_id: footerContainer.id,
          ...item,
          is_enabled: true,
          is_visible: true,
          item_type: 'link'
        });
      }
      
      console.log('✅ Menu items populated successfully!');
      
      // Verify the results
      const { data: mainItems } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_container_id', mainContainer.id)
        .order('sort_order');
      
      const { data: footerItems2 } = await supabase
        .from('menu_items')
        .select('*')
        .eq('menu_container_id', footerContainer.id)
        .order('sort_order');
      
      console.log(`\n📊 Results:`);
      console.log(`Main Navigation: ${mainItems?.length || 0} items`);
      console.log(`Footer Navigation: ${footerItems2?.length || 0} items`);
      
    } else {
      console.log('✅ SQL executed successfully!');
    }
    
  } catch (error) {
    console.error('❌ Error populating menu items:', error);
  }
}

populateMenuItems();