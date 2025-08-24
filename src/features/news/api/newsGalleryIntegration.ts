import { newsGalleryApi } from './newsGalleryApi';
import { articleGalleries } from '../data/newsContent';

export const newsGalleryIntegration = {
  /**
   * Initialize galleries for news articles
   */
  async initializeArticleGalleries() {
    const results = [];
    
    for (const [articleSlug, galleryData] of Object.entries(articleGalleries)) {
      try {
        // Create gallery for the article
        const gallery = await newsGalleryApi.createGallery({
          entityId: articleSlug, // Using slug as temporary ID
          entityType: 'news',
          title: galleryData.title,
          description: galleryData.description,
          images: galleryData.images,
          featured: galleryData.featured,
          allowDownload: galleryData.allowDownload,
          sortOrder: galleryData.sortOrder,
        });
        
        results.push({
          articleSlug,
          galleryId: gallery?.id,
          success: !!gallery,
        });
      } catch (error) {
        console.error(`Failed to create gallery for article ${articleSlug}:`, error);
        results.push({
          articleSlug,
          galleryId: null,
          success: false,
          error,
        });
      }
    }
    
    return results;
  },
  
  /**
   * Get gallery for a specific article
   */
  async getArticleGallery(articleSlug: string) {
    try {
      const galleries = await newsGalleryApi.getGalleriesByEntity(articleSlug, 'news');
      return galleries?.[0] || null;
    } catch (error) {
      console.error(`Failed to get gallery for article ${articleSlug}:`, error);
      return null;
    }
  },
  
  /**
   * Update gallery images for an article
   */
  async updateArticleGalleryImages(articleSlug: string, images: any[]) {
    try {
      const gallery = await this.getArticleGallery(articleSlug);
      if (!gallery) {
        console.error(`No gallery found for article ${articleSlug}`);
        return null;
      }
      
      return await newsGalleryApi.updateGalleryImages(gallery.id, images);
    } catch (error) {
      console.error(`Failed to update gallery images for article ${articleSlug}:`, error);
      return null;
    }
  },
  
  /**
   * Add image to article gallery
   */
  async addImageToArticleGallery(articleSlug: string, image: any) {
    try {
      const gallery = await this.getArticleGallery(articleSlug);
      if (!gallery) {
        console.error(`No gallery found for article ${articleSlug}`);
        return null;
      }
      
      return await newsGalleryApi.addImageToGallery(gallery.id, image);
    } catch (error) {
      console.error(`Failed to add image to gallery for article ${articleSlug}:`, error);
      return null;
    }
  },
  
  /**
   * Remove image from article gallery
   */
  async removeImageFromArticleGallery(articleSlug: string, imageId: string) {
    try {
      const gallery = await this.getArticleGallery(articleSlug);
      if (!gallery) {
        console.error(`No gallery found for article ${articleSlug}`);
        return false;
      }
      
      return await newsGalleryApi.removeImageFromGallery(gallery.id, imageId);
    } catch (error) {
      console.error(`Failed to remove image from gallery for article ${articleSlug}:`, error);
      return false;
    }
  },
  
  /**
   * Get featured galleries from news articles
   */
  async getFeaturedNewsGalleries() {
    try {
      return await newsGalleryApi.getFeaturedGalleries('news');
    } catch (error) {
      console.error('Failed to get featured news galleries:', error);
      return [];
    }
  },
  
  /**
   * Bulk create galleries for multiple articles
   */
  async bulkCreateArticleGalleries(articleGalleryMappings: Array<{ articleId: string; galleryData: any }>) {
    const results = [];
    
    for (const { articleId, galleryData } of articleGalleryMappings) {
      try {
        const gallery = await newsGalleryApi.createGallery({
          entityId: articleId,
          entityType: 'news',
          ...galleryData,
        });
        
        results.push({
          articleId,
          galleryId: gallery?.id,
          success: !!gallery,
        });
      } catch (error) {
        console.error(`Failed to create gallery for article ${articleId}:`, error);
        results.push({
          articleId,
          galleryId: null,
          success: false,
          error,
        });
      }
    }
    
    return results;
  },
};