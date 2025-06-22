import { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/utils/slugify';

export default function UpdateNewsSlugs() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [results, setResults] = useState<string[]>([]);

  const updateSlugs = async () => {
    setIsUpdating(true);
    setStatus('Fetching articles...');
    setResults([]);
    
    console.log('Starting slug update process...');
    
    try {
      // Fetch all news articles
      console.log('Fetching articles from Supabase...');
      const { data: articles, error } = await supabase
        .from('news')
        .select('id, title, slug')
        .order('created_at', { ascending: true });
      
      console.log('Fetch complete:', { articles, error });
      
      if (error) {
        setStatus(`Error fetching articles: ${error.message}`);
        setIsUpdating(false);
        return;
      }
      
      if (!articles || articles.length === 0) {
        setStatus('No articles found.');
        setIsUpdating(false);
        return;
      }
      
      setStatus(`Found ${articles.length} articles. Checking for missing slugs...`);
      
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
          setResults(prev => [...prev, `⚠️ Article ${article.id} has no title, skipping...`]);
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
        setStatus('✅ All articles already have slugs!');
        setIsUpdating(false);
        return;
      }
      
      setStatus(`Updating ${updates.length} articles with new slugs...`);
      
      // Update articles one by one
      let successCount = 0;
      for (const update of updates) {
        const { error: updateError } = await supabase
          .from('news')
          .update({ slug: update.slug })
          .eq('id', update.id);
        
        if (updateError) {
          setResults(prev => [...prev, `❌ Error updating article ${update.id}: ${updateError.message}`]);
        } else {
          successCount++;
          setResults(prev => [...prev, `✅ Updated "${update.title}" → ${update.slug}`]);
        }
      }
      
      setStatus(`✅ Update completed! ${successCount}/${updates.length} articles updated.`);
      
    } catch (error) {
      setStatus(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Update News Article Slugs</h2>
      <p className="text-gray-600 mb-4">
        This tool will generate URL-friendly slugs for any news articles that don't have them.
      </p>
      
      <Button
        onClick={updateSlugs}
        disabled={isUpdating}
        className="mb-4"
      >
        {isUpdating ? 'Updating...' : 'Update Slugs'}
      </Button>
      
      {status && (
        <div className={`p-3 rounded mb-4 ${
          status.includes('Error') ? 'bg-red-100 text-red-700' : 
          status.includes('✅') ? 'bg-green-100 text-green-700' : 
          'bg-blue-100 text-blue-700'
        }`}>
          {status}
        </div>
      )}
      
      {results.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Results:</h3>
          <div className="max-h-96 overflow-y-auto bg-gray-50 p-3 rounded">
            {results.map((result, index) => (
              <div key={index} className="text-sm py-1">
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}