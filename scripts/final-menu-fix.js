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
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalMenuFix() {
  try {
    console.log('🔧 Final menu fix - cleaning and repopulating...\n');
    
    // Step 1: Clean everything
    console.log('Step 1: Cleaning all menu data...');
    
    // Delete audit logs first
    await supabase.from('menu_audit_log').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Delete all menu items
    await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('✓ All menu items cleared\n');
    
    // Step 2: Ensure containers exist
    console.log('Step 2: Setting up containers...');
    
    const containers = [
      { name: 'main-navigation', type: 'main', title: 'Main Navigation', description: 'Primary site navigation menu', is_active: true },
      { name: 'footer-menu', type: 'footer', title: 'Footer Menu', description: 'Footer navigation links', is_active: true },
      { name: 'mobile-menu', type: 'mobile', title: 'Mobile Menu', description: 'Mobile navigation menu', is_active: true },
      { name: 'admin-menu', type: 'admin', title: 'Admin Menu', description: 'Administrative navigation menu', is_active: true }
    ];
    
    for (const container of containers) {
      await supabase.from('menu_containers').upsert(container, { onConflict: 'name' });
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
      throw new Error('Failed to get container IDs');
    }
    
    console.log('✓ Containers ready\n');
    
    // Step 3: Create main navigation items
    console.log('Step 3: Creating main navigation items...');
    
    const mainNavItems = [];
    
    // Community dropdown
    const { data: communityParent } = await supabase
      .from('menu_items')
      .insert({
        menu_container_id: mainContainer.id,
        title: 'Community',
        url: null,
        item_type: 'dropdown',
        sort_order: 100,
        is_enabled: true,
        is_visible: true,
        icon: 'users'
      })
      .select('id')
      .single();
    
    if (communityParent) {
      mainNavItems.push({ title: 'Community', type: 'dropdown', children: [] });
      
      const communityChildren = [
        { title: 'Events', url: '/events', description: 'Workshops, meetups, and tech talks', icon: 'calendar' },
        { title: 'Directory', url: '/directory', description: 'Connect with tech professionals', icon: 'users' },
        { title: 'Groups', url: '/groups', description: 'Join communities of interest', icon: 'user-group' },
        { title: 'News', url: '/news', description: 'Latest tech news and articles', icon: 'newspaper' },
        { title: 'Galleries', url: '/galleries', description: 'Browse community photo galleries', icon: 'photo' }
      ];
      
      for (let i = 0; i < communityChildren.length; i++) {
        const child = communityChildren[i];
        await supabase.from('menu_items').insert({
          menu_container_id: mainContainer.id,
          parent_id: communityParent.id,
          title: child.title,
          url: child.url,
          description: child.description,
          icon: child.icon,
          sort_order: 110 + (i * 10),
          is_enabled: true,
          is_visible: true,
          item_type: 'link'
        });
        mainNavItems[mainNavItems.length - 1].children.push(child.title);
      }
    }
    
    // Business dropdown
    const { data: businessParent } = await supabase
      .from('menu_items')
      .insert({
        menu_container_id: mainContainer.id,
        title: 'Business',
        url: null,
        item_type: 'dropdown',
        sort_order: 200,
        is_enabled: true,
        is_visible: true,
        icon: 'briefcase'
      })
      .select('id')
      .single();
    
    if (businessParent) {
      mainNavItems.push({ title: 'Business', type: 'dropdown', children: [] });
      
      const businessChildren = [
        { title: 'Companies', url: '/companies', description: 'Explore local tech companies', icon: 'building' },
        { title: 'Opportunities', url: '/opportunities', description: 'Find jobs and volunteer roles', icon: 'briefcase' },
        { title: 'Marketplace', url: '/marketplace', description: 'Buy and sell tech items', icon: 'shopping-bag' }
      ];
      
      for (let i = 0; i < businessChildren.length; i++) {
        const child = businessChildren[i];
        await supabase.from('menu_items').insert({
          menu_container_id: mainContainer.id,
          parent_id: businessParent.id,
          title: child.title,
          url: child.url,
          description: child.description,
          icon: child.icon,
          sort_order: 210 + (i * 10),
          is_enabled: true,
          is_visible: true,
          item_type: 'link'
        });
        mainNavItems[mainNavItems.length - 1].children.push(child.title);
      }
    }
    
    // Standalone items
    await supabase.from('menu_items').insert({
      menu_container_id: mainContainer.id,
      title: 'Resources',
      url: '/resources',
      description: 'Educational content and guides',
      icon: 'book-open',
      sort_order: 300,
      is_enabled: true,
      is_visible: true,
      item_type: 'link'
    });
    mainNavItems.push({ title: 'Resources', type: 'link' });
    
    await supabase.from('menu_items').insert({
      menu_container_id: mainContainer.id,
      title: 'Topics',
      url: '/topics',
      description: 'Browse content by topic',
      icon: 'tag',
      sort_order: 400,
      is_enabled: true,
      is_visible: true,
      item_type: 'link'
    });
    mainNavItems.push({ title: 'Topics', type: 'link' });
    
    // About dropdown
    const { data: aboutParent } = await supabase
      .from('menu_items')
      .insert({
        menu_container_id: mainContainer.id,
        title: 'About',
        url: null,
        item_type: 'dropdown',
        sort_order: 500,
        is_enabled: true,
        is_visible: true,
        icon: 'info'
      })
      .select('id')
      .single();
    
    if (aboutParent) {
      mainNavItems.push({ title: 'About', type: 'dropdown', children: [] });
      
      const aboutChildren = [
        { title: 'About Us', url: '/about', description: 'Learn about our mission', icon: 'info' },
        { title: 'About Uluntu', url: '/about-uluntu', description: 'Learn about the Uluntu platform', icon: 'globe' },
        { title: 'Partners', url: '/partners', description: 'Our community partners and sponsors', icon: 'handshake' },
        { title: 'Contact', url: '/contact', description: 'Get in touch with us', icon: 'mail' },
        { title: 'Privacy', url: '/privacy', description: 'Privacy policy and data protection', icon: 'shield' },
        { title: 'Terms', url: '/terms', description: 'Terms of service and guidelines', icon: 'file-text' }
      ];
      
      for (let i = 0; i < aboutChildren.length; i++) {
        const child = aboutChildren[i];
        await supabase.from('menu_items').insert({
          menu_container_id: mainContainer.id,
          parent_id: aboutParent.id,
          title: child.title,
          url: child.url,
          description: child.description,
          icon: child.icon,
          sort_order: 510 + (i * 10),
          is_enabled: true,
          is_visible: true,
          item_type: 'link'
        });
        mainNavItems[mainNavItems.length - 1].children.push(child.title);
      }
    }
    
    console.log('✓ Main navigation created:');
    for (const item of mainNavItems) {
      if (item.type === 'dropdown') {
        console.log(`  📁 ${item.title}`);
        for (const child of item.children) {
          console.log(`     └─ ${child}`);
        }
      } else {
        console.log(`  📄 ${item.title}`);
      }
    }
    console.log('');
    
    // Step 4: Create footer navigation
    console.log('Step 4: Creating footer navigation...');
    
    const footerItems = [
      'Community', 'Directory', 'Companies', 'Groups', 'Resources',
      'Events', 'News', 'About', 'Contact', 'Privacy', 'Terms'
    ];
    
    for (let i = 0; i < footerItems.length; i++) {
      const title = footerItems[i];
      const url = `/${title.toLowerCase().replace(/ /g, '-')}`;
      
      await supabase.from('menu_items').insert({
        menu_container_id: footerContainer.id,
        title: title,
        url: url,
        sort_order: 100 + (i * 100),
        is_enabled: true,
        is_visible: true,
        item_type: 'link'
      });
    }
    
    console.log(`✓ Footer navigation created: ${footerItems.length} items\n`);
    
    // Step 5: Verify final state
    console.log('Step 5: Verifying final state...');
    
    const { count: mainCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('menu_container_id', mainContainer.id);
    
    const { count: footerCount } = await supabase
      .from('menu_items')
      .select('*', { count: 'exact', head: true })
      .eq('menu_container_id', footerContainer.id);
    
    console.log('📊 Final counts:');
    console.log(`  Main Navigation: ${mainCount} items`);
    console.log(`  Footer Navigation: ${footerCount} items`);
    console.log(`  Total: ${(mainCount || 0) + (footerCount || 0)} items`);
    
    console.log('\n✅ Menu system successfully fixed and populated!');
    console.log('🎉 You can now visit the Menu Management page to see the items.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

finalMenuFix();