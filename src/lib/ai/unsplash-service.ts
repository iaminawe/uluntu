interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  description: string | null;
  alt_description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
  };
  width: number;
  height: number;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
  total: number;
  total_pages: number;
}

export class UnsplashService {
  private accessKey: string | undefined;
  private baseUrl = 'https://api.unsplash.com';

  constructor() {
    this.accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
  }

  isConfigured(): boolean {
    return !!this.accessKey;
  }

  /**
   * Search for photos based on a query
   */
  async searchPhotos(
    query: string, 
    options: {
      perPage?: number;
      orientation?: 'landscape' | 'portrait' | 'squarish';
      page?: number;
    } = {}
  ): Promise<UnsplashPhoto[]> {
    if (!this.isConfigured()) {
      console.warn('Unsplash API key not configured');
      return [];
    }

    const { perPage = 3, orientation = 'landscape', page = 1 } = options;

    try {
      console.log(`Searching Unsplash for: "${query}" (page: ${page}, perPage: ${perPage})`);
      
      const params = new URLSearchParams({
        query,
        per_page: perPage.toString(),
        orientation,
        page: page.toString(),
      });

      const url = `${this.baseUrl}/search/photos?${params}`;
      console.log('Unsplash API URL:', url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Client-ID ${this.accessKey}`,
        },
      });

      console.log('Unsplash API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unsplash API error response:', errorText);
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`);
      }

      const data: UnsplashSearchResponse = await response.json();
      console.log(`Found ${data.results.length} photos for "${query}"`);
      
      if (data.results.length > 0) {
        console.log('First photo URL:', data.results[0].urls.regular);
      }
      
      return data.results;
    } catch (error) {
      console.error('Failed to search Unsplash photos:', error);
      return [];
    }
  }

  /**
   * Get a random photo based on a query
   */
  async getRandomPhoto(query?: string): Promise<UnsplashPhoto | null> {
    if (!this.isConfigured()) {
      console.warn('Unsplash API key not configured');
      return null;
    }

    try {
      const params = new URLSearchParams();
      if (query) {
        params.append('query', query);
      }

      const response = await fetch(
        `${this.baseUrl}/photos/random?${params}`,
        {
          headers: {
            Authorization: `Client-ID ${this.accessKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data: UnsplashPhoto = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to get random Unsplash photo:', error);
      return null;
    }
  }

  /**
   * Extract keywords from text for image search
   */
  extractKeywords(text: string, topic?: string): string[] {
    // Start with the topic if provided
    const keywords: string[] = topic ? [topic] : [];
    
    // Common words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall',
      'let', 'make', 'made', 'get', 'got', 'go', 'going', 'went', 'come',
      'came', 'coming', 'this', 'that', 'these', 'those', 'what', 'which',
      'who', 'whom', 'whose', 'where', 'when', 'why', 'how', 'all', 'each',
      'every', 'both', 'few', 'many', 'much', 'other', 'another', 'such',
      'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'now'
    ]);
    
    // Extract potential keywords from the text
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => 
        word.length > 3 && 
        !stopWords.has(word) &&
        !keywords.includes(word)
      );
    
    // Get unique words, prioritizing longer/more specific terms
    const uniqueWords = [...new Set(words)]
      .sort((a, b) => b.length - a.length)
      .slice(0, 5);
    
    keywords.push(...uniqueWords);
    
    return keywords.slice(0, 3); // Return top 3 keywords
  }

  /**
   * Format photo attribution for proper credit
   */
  formatAttribution(photo: UnsplashPhoto): string {
    return `Photo by [${photo.user.name}](${photo.user.links.html}) on [Unsplash](https://unsplash.com)`;
  }

  /**
   * Get the best size URL for BlockNote editor
   */
  getOptimalImageUrl(photo: UnsplashPhoto, width: number = 1200): string {
    // Use regular size for blog posts (1080px wide)
    if (width <= 600) return photo.urls.small;
    if (width <= 1080) return photo.urls.regular;
    return photo.urls.full;
  }

  /**
   * Search for photos relevant to blog post sections
   */
  async findRelevantPhotos(
    content: string,
    topic: string,
    count: number = 3
  ): Promise<Array<{ photo: UnsplashPhoto; placement: 'hero' | 'section' | 'conclusion' }>> {
    console.log(`Finding relevant photos for topic: "${topic}", count: ${count}`);
    
    if (!this.isConfigured()) {
      console.warn('Unsplash not configured - cannot fetch photos');
      return [];
    }

    const photos: Array<{ photo: UnsplashPhoto; placement: 'hero' | 'section' | 'conclusion' }> = [];
    
    try {
      // Get hero image for the main topic
      console.log('Fetching hero image for topic:', topic);
      const heroPhotos = await this.searchPhotos(topic, { 
        perPage: 1, 
        orientation: 'landscape' 
      });
      if (heroPhotos.length > 0) {
        console.log('Hero photo found:', heroPhotos[0].urls.regular);
        photos.push({ photo: heroPhotos[0], placement: 'hero' });
      } else {
        console.log('No hero photo found for topic:', topic);
      }

      // Extract keywords for section images
      const keywords = this.extractKeywords(content, topic);
      console.log('Extracted keywords:', keywords);
      
      // Get section images based on keywords
      for (let i = 0; i < Math.min(keywords.length, count - 1); i++) {
        console.log(`Fetching section image for keyword: "${keywords[i]}"`);
        const sectionPhotos = await this.searchPhotos(keywords[i], { 
          perPage: 1,
          orientation: 'landscape'
        });
        if (sectionPhotos.length > 0) {
          console.log('Section photo found:', sectionPhotos[0].urls.regular);
          photos.push({ 
            photo: sectionPhotos[0], 
            placement: i === keywords.length - 1 ? 'conclusion' : 'section' 
          });
        } else {
          console.log('No photo found for keyword:', keywords[i]);
        }
      }

      // If we don't have enough photos, get some random ones related to the topic
      if (photos.length < count) {
        console.log(`Need ${count - photos.length} more photos, fetching additional from topic`);
        const additionalPhotos = await this.searchPhotos(topic, {
          perPage: count - photos.length,
          page: 2 // Get different results
        });
        additionalPhotos.forEach(photo => {
          console.log('Additional photo found:', photo.urls.regular);
          photos.push({ photo, placement: 'section' });
        });
      }

      console.log(`Total photos found: ${photos.length}`);
    } catch (error) {
      console.error('Error finding relevant photos:', error);
    }

    return photos;
  }
}

// Export singleton instance
export const unsplashService = new UnsplashService();