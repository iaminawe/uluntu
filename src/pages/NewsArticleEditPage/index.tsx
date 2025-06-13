import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { ContentContainer, PageHeader } from '@/shared/components/ui/PageLayout';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Label } from '@/shared/components/ui/Label';
import { Textarea } from '@/shared/components/ui/Textarea';
import { Switch } from '@/shared/components/ui/Switch';
import { TagsInput } from '@/shared/components/ui/TagsInput';
import { Card } from '@/shared/components/ui/Card';
import { NewsArticleInput } from '../../types/news';
import { useNewsArticleByIdRedux, useNewsArticlesRedux } from '../../hooks/useNewsRedux';

// Form validation schema
const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(5, 'Slug must be at least 5 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  image: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  hero_image_alt: z.string().optional(),
  tags: z.array(z.string()),
  featured: z.boolean().default(false),
  status: z.enum(['draft', 'published', 'archived']).default('draft')
});

type FormValues = z.infer<typeof formSchema>;

export default function NewsArticleEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewArticle = !id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redux hooks
  const { 
    article, 
    isLoading: articleLoading,
    isError: articleError 
  } = useNewsArticleByIdRedux(id || '');
  
  const { 
    createArticle,
    updateArticle
  } = useNewsArticlesRedux();
  
  // React Hook Form setup
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      hero_image_alt: '',
      tags: [],
      featured: false,
      status: 'draft'
    }
  });
  
  // Update form when article data is loaded
  useEffect(() => {
    if (article && !isNewArticle) {
      reset({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        image: article.image || '',
        hero_image_alt: article.hero_image_alt || '',
        tags: article.tags || [],
        featured: article.featured || false,
        status: article.status || 'draft'
      });
    }
  }, [article, isNewArticle, reset]);
  
  // Auto-generate slug from title
  const title = watch('title');
  useEffect(() => {
    if (isNewArticle && title) {
      setValue(
        'slug', 
        title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  }, [title, isNewArticle, setValue]);
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isNewArticle) {
        // Create new article
        const newArticle = await createArticle(data as NewsArticleInput);
        if (newArticle) {
          navigate(`/news/${newArticle.id}`);
        }
      } else if (id) {
        // Update existing article
        const updatedArticle = await updateArticle({
          id,
          data: data as Partial<NewsArticleInput>
        });
        
        if (updatedArticle) {
          navigate(`/news/${updatedArticle.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (articleLoading && !isNewArticle) {
    return (
      <ContentContainer>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </ContentContainer>
    );
  }
  
  // Error state
  if (articleError && !isNewArticle) {
    return (
      <ContentContainer>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Article</h2>
          <p className="mb-4">We couldn't load the article you're trying to edit.</p>
          <Button onClick={() => navigate('/news')}>Back to News</Button>
        </div>
      </ContentContainer>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{isNewArticle ? 'Create News Article' : 'Edit News Article'} - Kootenay Tech Community</title>
      </Helmet>
      
      <PageHeader
        title={isNewArticle ? 'Create News Article' : 'Edit News Article'}
        description="Share the latest tech news and updates with the community"
        backgroundImage="/images/backgrounds/mountain-backdrop-04.jpg"
      />
      
      <ContentContainer>
        <Card className="max-w-3xl mx-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>
            
            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                {...register('slug')}
                className={errors.slug ? 'border-red-500' : ''}
              />
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
              )}
              <p className="text-sm text-slate-500 mt-1">
                This will be used in the URL: /news/<span className="font-mono">{watch('slug') || 'your-article-slug'}</span>
              </p>
            </div>
            
            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                {...register('excerpt')}
                className={errors.excerpt ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.excerpt && (
                <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>
              )}
              <p className="text-sm text-slate-500 mt-1">
                A short summary that appears in article listings.
              </p>
            </div>
            
            {/* Content */}
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                {...register('content')}
                className={errors.content ? 'border-red-500' : ''}
                rows={12}
              />
              {errors.content && (
                <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
              )}
            </div>
            
            {/* Image */}
            <div>
              <Label htmlFor="image">Featured Image URL</Label>
              <Input
                id="image"
                {...register('image')}
                className={errors.image ? 'border-red-500' : ''}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>
              )}
            </div>
            
            {/* Image Alt Text */}
            <div>
              <Label htmlFor="hero_image_alt">Image Alt Text</Label>
              <Input
                id="hero_image_alt"
                {...register('hero_image_alt')}
                className={errors.hero_image_alt ? 'border-red-500' : ''}
              />
              {errors.hero_image_alt && (
                <p className="text-red-500 text-sm mt-1">{errors.hero_image_alt.message}</p>
              )}
            </div>
            
            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <TagsInput
                id="tags"
                value={watch('tags')}
                onChange={(tags) => setValue('tags', tags)}
                placeholder="Add tags..."
              />
              <p className="text-sm text-slate-500 mt-1">
                Press Enter to add a tag.
              </p>
            </div>
            
            {/* Featured Switch */}
            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={watch('featured')}
                onCheckedChange={(checked) => setValue('featured', checked)}
              />
              <Label htmlFor="featured">Featured Article</Label>
            </div>
            
            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/news')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isNewArticle ? 'Create Article' : 'Update Article'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </ContentContainer>
    </>
  );
}
