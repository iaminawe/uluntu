const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/^-+|-+$/g, '')  // Remove leading/trailing hyphens
    .replace(/-+/g, '-');     // Replace multiple hyphens with single hyphen
}

async function updateNewsSlugs() {
  console.log('Starting slug update...');
  
  try {
    // First, count articles without slugs
    const { count } = await supabase
      .from('news')
      .select('*', { count: 'exact', head: true })
      .is('slug', null);
    
    console.log(`Found ${count} articles without slugs`);
    
    if (count === 0) {
      console.log('All articles already have slugs!');
      return;
    }
    
    // Fetch articles without slugs
    const { data: articles, error } = await supabase
      .from('news')
      .select('id, title')
      .is('slug', null);
    
    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }
    
    // Update each article
    let updated = 0;
    const usedSlugs = new Set();
    
    for (const article of articles) {
      if (!article.title) {
        console.log(`Skipping article ${article.id} - no title`);
        continue;
      }
      
      let baseSlug = generateSlug(article.title);
      let slug = baseSlug;
      let counter = 1;
      
      // Ensure unique slug
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      usedSlugs.add(slug);
      
      const { error: updateError } = await supabase
        .from('news')
        .update({ slug })
        .eq('id', article.id);
      
      if (updateError) {
        console.error(`Error updating article ${article.id}:`, updateError);
      } else {
        updated++;
        console.log(`Updated: "${article.title}" -> ${slug}`);
      }
    }
    
    console.log(`\nDone! Updated ${updated}/${articles.length} articles.`);
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Run the update
updateNewsSlugs();