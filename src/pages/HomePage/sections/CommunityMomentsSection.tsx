import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { newsApi } from '@/features/news/api/newsApi';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { DetailedCard } from '@/shared/components/visual';

export default function CommunityMomentsSection() {
  const { data: news = [], isLoading: newsLoading } = useQuery({
    queryKey: ['news-home'],
    queryFn: () => newsApi.getAll({ limit: 4 }),
    staleTime: 5 * 60 * 1000,
  });
  
  const { data: galleriesResponse, isLoading: galleriesLoading } = useQuery({
    queryKey: ['galleries-home'],
    queryFn: () => galleryApi.getAllGalleries({ limit: 2 }),
    staleTime: 5 * 60 * 1000,
  });
  
  const galleries = galleriesResponse?.galleries || [];
  
  const communityMoments = useMemo(() => {
    // Get latest news articles
    const newsItems = news.slice(0, 4).map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.excerpt,
      image: article.image,
      date: article.date,
      author: article.author,
      category: article.tags?.includes('blog') ? 'Blog' : 'News',
      readTime: '5 min read',
      link: `/news/${article.slug || article.id}`,
      type: 'news' as const
    }));
    
    // Get featured galleries
    const galleryItems = galleries
      .filter(gallery => gallery.privacy === 'public' || gallery.privacy_level === 'public')
      .slice(0, 2)
      .map(gallery => {
        const photos = gallery.photos || gallery.gallery_photos || [];
        const firstPhoto = photos[0];
        let imageUrl = gallery.coverImage || firstPhoto?.url || firstPhoto?.thumbnail_path;
        
        return {
          id: gallery.id,
          title: gallery.title,
          excerpt: gallery.description || 'A collection of photos from our community',
          image: imageUrl,
          date: gallery.created_at || gallery.createdAt,
          author: gallery.owner || { id: '1', name: 'Community', image: '' },
          category: 'Gallery',
          readTime: `${photos.length} photos`,
          link: `/galleries/${gallery.id}`,
          type: 'gallery' as const
        };
      });
    
    return [...newsItems, ...galleryItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [news, galleries]);

  if ((newsLoading && galleriesLoading) || communityMoments.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white dark:bg-slate-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Community Moments
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Latest news, blogs, and galleries from our community
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communityMoments.map((item) => (
            <DetailedCard
              key={`${item.type}-${item.id}`}
              id={item.id}
              title={item.title}
              excerpt={item.excerpt}
              image={item.image}
              date={item.date}
              author={item.author}
              category={item.category}
              readTime={item.readTime}
              link={item.link}
              linkText={item.type === 'gallery' ? 'View Gallery' : 'Read More'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}