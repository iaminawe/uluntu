import { supabase } from '../src/lib/supabase';
import { generateSlug } from '../src/utils/slugify';

async function updateNewsArticleSlugs() {
  console.log('Starting to update news article slugs...');
  
  try {
    // Fetch all news articles
    const { data: articles, error } = await supabase
      .from('news')
      .select('id, title, slug')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }
    
    if (!articles || articles.length === 0) {
      console.log('No articles found.');
      return;
    }
    
    console.log(`Found ${articles.length} articles.`);
    
    // Track used slugs to ensure uniqueness
    const usedSlugs = new Set<string>();
    const updates = [];
    
    for (const article of articles) {
      // Skip if already has a valid slug
      if (article.slug && article.slug.trim() !== '') {
        usedSlugs.add(article.slug);
        continue;
      }
      
      if (!article.title) {
        console.warn(`Article ${article.id} has no title, skipping...`);
        continue;
      }
      
      // Generate a base slug
      let baseSlug = generateSlug(article.title, { strict: true });
      let finalSlug = baseSlug;
      let counter = 1;
      
      // Ensure uniqueness
      while (usedSlugs.has(finalSlug)) {
        finalSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      usedSlugs.add(finalSlug);
      updates.push({
        id: article.id,
        slug: finalSlug,
        title: article.title
      });
    }
    
    if (updates.length === 0) {
      console.log('All articles already have slugs.');
      return;
    }
    
    console.log(`Updating ${updates.length} articles with new slugs...`);
    
    // Update articles one by one (you could batch this if needed)
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('news')
        .update({ slug: update.slug })
        .eq('id', update.id);
      
      if (updateError) {
        console.error(`Error updating article ${update.id}:`, updateError);
      } else {
        console.log(`Updated article "${update.title}" with slug: ${update.slug}`);
      }
    }
    
    console.log('Slug update completed!');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the update
updateNewsArticleSlugs();