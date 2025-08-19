#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Try service role key first to bypass RLS
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Check if we have service role key
const hasServiceRole = (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ? true : false;
console.log(`Using ${hasServiceRole ? 'service role' : 'anon'} key`);

async function resetAndPopulateMenuItems() {
  try {
    console.log('🔄 Resetting menu items to match hardcoded navigation...');
    
    // First, delete all existing menu items
    console.log('🗑️  Clearing existing menu items...');
    const { error: deleteError } = await supabase
      .from('menu_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all (using impossible UUID)
    
    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error deleting items:', deleteError);
    }
    
    // Ensure containers exist with correct names
    console.log('📦 Setting up menu containers...');
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
    
    console.log('🎯 Populating main navigation with hardcoded structure...');
    
    // ========================================
    // MAIN NAVIGATION - Matching NavigationProvider.tsx
    // ========================================
    
    // Community (parent with dropdown)
    const { data: communityParent, error: communityError } = await supabase
      .from('menu_items')
      .insert({
        menu_container_id: mainContainer.id,
        title: 'Community',
        url: null, // Dropdown items should have null URL
        sort_order: 100,
        is_enabled: true,
        is_visible: true,
        item_type: 'dropdown',
        icon: 'users'
      })
      .select('id')
      .single();
    
    if (communityError) {
      console.error('Error creating Community parent:', communityError);
    }
    
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
        const { error } = await supabase.from('menu_items').insert({
          menu_container_id: mainContainer.id,
          parent_id: communityParent.id,
          ...child,
          is_enabled: true,
          is_visible: true,
          item_type: 'link'
        });
        if (error) console.error(`Error creating ${child.title}:`, error);
      }
    }
    
    // Business (parent with dropdown)
    const { data: businessParent, error: businessError } = await supabase
      .from('menu_items')
      .insert({
        menu_container_id: mainContainer.id,
        title: 'Business',
        url: null, // Dropdown items should have null URL
        sort_order: 200,
        is_enabled: true,
        is_visible: true,
        item_type: 'dropdown',
        icon: 'briefcase'
      })
      .select('id')
      .single();
    
    if (businessError) {
      console.error('Error creating Business parent:', businessError);
    }
    
    // Business children
    if (businessParent) {
      const businessChildren = [
        { title: 'Companies', url: '/companies', description: 'Explore local tech companies', sort_order: 210, icon: 'building', custom_properties: { feature: 'companies_listing' } },
        { title: 'Opportunities', url: '/opportunities', description: 'Find jobs and volunteer roles', sort_order: 220, icon: 'briefcase', custom_properties: { feature: 'opportunities_board' } },
        { title: 'Marketplace', url: '/marketplace', description: 'Buy and sell tech items', sort_order: 230, icon: 'shopping-bag', custom_properties: { feature: 'marketplace' } }
      ];
      
      for (const child of businessChildren) {
        const { error } = await supabase.from('menu_items').insert({
          menu_container_id: mainContainer.id,
          parent_id: businessParent.id,
          ...child,
          is_enabled: true,
          is_visible: true,
          item_type: 'link'
        });
        if (error) console.error(`Error creating ${child.title}:`, error);
      }
    }
    
    // Resources (standalone link)
    const { error: resourcesError } = await supabase.from('menu_items').insert({
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
    if (resourcesError) console.error('Error creating Resources:', resourcesError);
    
    // Topics (standalone link)
    const { error: topicsError } = await supabase.from('menu_items').insert({
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
    if (topicsError) console.error('Error creating Topics:', topicsError);
    
    // About (parent with dropdown)
    const { data: aboutParent, error: aboutError } = await supabase
      .from('menu_items')
      .insert({
        menu_container_id: mainContainer.id,
        title: 'About',
        url: null, // Dropdown items should have null URL
        sort_order: 500,
        is_enabled: true,
        is_visible: true,
        item_type: 'dropdown',
        icon: 'info'
      })
      .select('id')
      .single();
    
    if (aboutError) {
      console.error('Error creating About parent:', aboutError);
    }
    
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
        const { error } = await supabase.from('menu_items').insert({
          menu_container_id: mainContainer.id,
          parent_id: aboutParent.id,
          ...child,
          is_enabled: true,
          is_visible: true,
          item_type: 'link'
        });
        if (error) console.error(`Error creating ${child.title}:`, error);
      }
    }
    
    console.log('🦶 Populating footer navigation...');
    
    // ========================================
    // FOOTER NAVIGATION - Flat structure
    // ========================================
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
      const { error } = await supabase.from('menu_items').insert({
        menu_container_id: footerContainer.id,
        ...item,
        is_enabled: true,
        is_visible: true,
        item_type: 'link'
      });
      if (error) console.error(`Error creating footer item ${item.title}:`, error);
    }
    
    console.log('✅ Menu items populated successfully!');
    
    // Verify the results
    console.log('\n📊 Verification:');
    
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
    
    console.log(`Main Navigation: ${mainItems?.length || 0} items`);
    console.log(`Footer Navigation: ${footerItems2?.length || 0} items`);
    
    // Show hierarchical structure
    console.log('\n📋 Main Navigation Structure:');
    const topLevel = mainItems?.filter(item => !item.parent_id) || [];
    for (const parent of topLevel) {
      console.log(`📁 ${parent.title} (${parent.url})`);
      const children = mainItems?.filter(item => item.parent_id === parent.id) || [];
      for (const child of children) {
        console.log(`   └─ ${child.title} (${child.url})`);
      }
    }
    
    console.log('\n🔗 Footer Links:');
    for (const item of footerItems2 || []) {
      console.log(`• ${item.title} (${item.url})`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

resetAndPopulateMenuItems();