const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Sample marketplace listings data
const marketplaceListings = [
  {
    title: 'MacBook Pro 16" - M1 Max',
    description: 'Powerful MacBook Pro with M1 Max chip, 32GB RAM, 1TB SSD. Great condition, only used for 1 year.',
    type: 'product',
    price: 2500,
    condition: 'used',
    status: 'published',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop'
    ],
    location: 'Nelson, BC',
    tags: ['electronics', 'laptop', 'apple'],
    featured: true,
    seller_id: '63dba8cb-3ac3-4c9c-afe3-1a21654f67c0' // Replace with an actual user ID from your users table
  },
  {
    title: 'Web Development Services',
    description: 'Full-stack web development services. Specializing in React, Node.js, and modern web technologies.',
    type: 'service',
    price: 75, // hourly rate
    condition: null,
    status: 'published',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop'
    ],
    location: 'Remote',
    tags: ['services', 'development', 'website'],
    featured: true,
    seller_id: '63dba8cb-3ac3-4c9c-afe3-1a21654f67c0' // Replace with an actual user ID from your users table
  },
  {
    title: 'Graphic Design Monitor - Dell UltraSharp 27"',
    description: 'Professional 4K color-calibrated monitor, perfect for graphic designers and photographers.',
    type: 'product',
    price: 450,
    condition: 'like-new',
    status: 'published',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop'
    ],
    location: 'Castlegar, BC',
    tags: ['electronics', 'monitor', 'design'],
    featured: false,
    seller_id: '63dba8cb-3ac3-4c9c-afe3-1a21654f67c0' // Replace with an actual user ID from your users table
  },
  {
    title: 'Technical Writing Services',
    description: 'Experienced technical writer available for documentation, tutorials, and user guides.',
    type: 'service',
    price: 60, // hourly rate
    condition: null,
    status: 'published',
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1000&auto=format&fit=crop'
    ],
    location: 'Remote',
    tags: ['services', 'writing', 'documentation'],
    featured: false,
    seller_id: '63dba8cb-3ac3-4c9c-afe3-1a21654f67c0' // Replace with an actual user ID from your users table
  },
  {
    title: 'Logitech MX Master 3 Mouse',
    description: 'Ergonomic wireless mouse, perfect for developers and designers. Like new condition.',
    type: 'product',
    price: 80,
    condition: 'like-new',
    status: 'published',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=1000&auto=format&fit=crop'
    ],
    location: 'Trail, BC',
    tags: ['electronics', 'peripherals'],
    featured: false,
    seller_id: '63dba8cb-3ac3-4c9c-afe3-1a21654f67c0' // Replace with an actual user ID from your users table
  }
];

// Function to seed the marketplace_listings table
async function seedMarketplaceListings() {
  try {
    console.log('Starting to seed marketplace listings...');
    
    // Check if table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('marketplace_listings')
      .select('count()', { count: 'exact', head: true });
    
    if (tableError && tableError.code === '42P01') {
      console.error('Table marketplace_listings does not exist. Creating table...');
      // Create table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_marketplace_listings_table');
      if (createError) {
        throw createError;
      }
    } else if (tableError) {
      throw tableError;
    }
    
    // Clear existing records (optional)
    console.log('Clearing existing marketplace listings...');
    const { error: deleteError } = await supabase
      .from('marketplace_listings')
      .delete()
      .not('id', 'is', null); // Safety check to avoid deleting with no where clause
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Insert new records
    console.log('Inserting new marketplace listings...');
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert(marketplaceListings)
      .select();
    
    if (error) {
      throw error;
    }
    
    console.log(`Successfully seeded ${data.length} marketplace listings.`);
    console.log('First listing:', data[0]);
    
    return data;
  } catch (error) {
    console.error('Error seeding marketplace listings:', error);
    throw error;
  }
}

// Run the seed function
seedMarketplaceListings()
  .then(() => {
    console.log('Seeding completed successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
