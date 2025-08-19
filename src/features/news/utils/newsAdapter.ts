import { Database } from '../types/supabase';
import { NewsArticle, ContentStatus } from '../types';

type SupabaseNewsArticleRow = Database['public']['Tables']['news']['Row'];
export type SupabaseNewsArticleWithAuthor = SupabaseNewsArticleRow & { 
  members?: Database['public']['Tables']['members']['Row'] | null;
};

export function adaptNewsArticleFromDatabase(dbArticle: SupabaseNewsArticleWithAuthor): NewsArticle {
  return {
    id: dbArticle.id,
    title: dbArticle.title,
    slug: dbArticle.slug,
    excerpt: dbArticle.excerpt || '',
    content: dbArticle.content,
    date: dbArticle.publish_date || dbArticle.created_at || new Date().toISOString(),
    image: dbArticle.hero_image || undefined,
    hero_image_alt: dbArticle.hero_image_alt || undefined,
    author: {
      id: dbArticle.members?.id || dbArticle.author_id || 'UNKNOWN_AUTHOR_ID',
      name: dbArticle.members?.name || 'Unknown Author',
      image: dbArticle.members?.image || '/placeholder-avatar.png'
    },
    tags: dbArticle.tags || undefined,
    status: (dbArticle.status || 'draft') as ContentStatus,
    featured: dbArticle.featured || false,
    created_at: dbArticle.created_at || new Date().toISOString()
  };
}

export function adaptNewsArticleToDatabase(article: Partial<NewsArticle>): Partial<SupabaseNewsArticleRow> {
  return {
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || undefined,
    content: article.content,
    publish_date: article.date || undefined,
    hero_image: article.image || undefined,
    hero_image_alt: article.hero_image_alt || undefined,
    author_id: article.author?.id || undefined,
    tags: article.tags || undefined,
    status: article.status || 'draft',
    featured: article.featured || undefined
  };
}