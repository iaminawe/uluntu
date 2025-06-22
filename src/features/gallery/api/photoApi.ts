import { supabase, handleSupabaseError } from '@/api/supabaseUtils';
import {
  Photo,
  PhotoFilters,
  PhotosResponse,
  CreatePhotoData,
  UpdatePhotoData,
  PhotoAnalytics,
  PhotoMetadata,
  SearchResult,
  PhotoSearch
} from '../types';

class PhotoApi {
  private tableName = 'photos';
  private analyticsTableName = 'photo_analytics';

  async getPhotos(params?: {
    filters?: PhotoFilters;
    page?: number;
    limit?: number;
  }): Promise<PhotosResponse> {
    try {
      const {
        filters = {},
        page = 1,
        limit = 24,
      } = params || {};

      let query = supabase
        .from(this.tableName)
        .select(`
          *,
          gallery:galleries!photos_gallery_id_fkey(
            id,
            title,
            slug
          ),
          uploader:members!photos_uploaded_by_fkey(
            id,
            name,
            image
          )
        `, { count: 'exact' });

      // Apply filters
      if (filters.status && filters.status !== 'draft') {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.galleryId) {
        query = query.eq('gallery_id', filters.galleryId);
      }

      if (filters.uploadedBy) {
        query = query.eq('uploaded_by', filters.uploadedBy);
      }

      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured);
      }

      if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach(tag => {
          query = query.contains('tags', [tag]);
        });
      }

      if (filters.dateRange) {
        query = query
          .gte('uploaded_at', filters.dateRange.start)
          .lte('uploaded_at', filters.dateRange.end);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'uploaded_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw handleSupabaseError(error);
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data as Photo[],
        page,
        limit,
        total: count || 0,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  }

  async getPhotoById(id: string): Promise<Photo> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(`
          *,
          gallery:galleries!photos_gallery_id_fkey(
            id,
            title,
            slug
          ),
          uploader:members!photos_uploaded_by_fkey(
            id,
            name,
            image
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as Photo;
    } catch (error) {
      console.error('Error fetching photo by ID:', error);
      throw error;
    }
  }

  async createPhoto(photoData: CreatePhotoData): Promise<Photo> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const newPhoto = {
        ...photoData,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
        status: 'draft',
        is_public: photoData.isPublic || false,
        featured: photoData.featured || false,
        views: 0,
        downloads: 0,
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(newPhoto)
        .select(`
          *,
          gallery:galleries!photos_gallery_id_fkey(
            id,
            title,
            slug
          ),
          uploader:members!photos_uploaded_by_fkey(
            id,
            name,
            image
          )
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as Photo;
    } catch (error) {
      console.error('Error creating photo:', error);
      throw error;
    }
  }

  async updatePhoto(photoData: UpdatePhotoData): Promise<Photo> {
    try {
      const { id, ...updates } = photoData;

      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(`
          *,
          gallery:galleries!photos_gallery_id_fkey(
            id,
            title,
            slug
          ),
          uploader:members!photos_uploaded_by_fkey(
            id,
            name,
            image
          )
        `)
        .single();

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as Photo;
    } catch (error) {
      console.error('Error updating photo:', error);
      throw error;
    }
  }

  async deletePhoto(id: string): Promise<boolean> {
    try {
      // First get the photo to access file paths
      const photo = await this.getPhotoById(id);
      
      // Delete files from storage
      const filePaths = [photo.url, photo.thumbnailUrl, photo.originalUrl].filter(Boolean);
      if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('photos')
          .remove(filePaths.map(url => this.extractPathFromUrl(url!)));

        if (storageError) {
          console.error('Error deleting files from storage:', storageError);
        }
      }

      // Delete photo record
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  async publishPhoto(id: string): Promise<Photo> {
    return this.updatePhoto({
      id,
      status: 'published',
    });
  }

  async unpublishPhoto(id: string): Promise<Photo> {
    return this.updatePhoto({
      id,
      status: 'draft',
    });
  }

  async reorderPhotos(galleryId: string, photoIds: string[]): Promise<boolean> {
    try {
      const updates = photoIds.map((photoId, index) => ({
        id: photoId,
        order_index: index,
      }));

      const { error } = await supabase.rpc('batch_update_photo_order', {
        updates
      });

      if (error) {
        throw handleSupabaseError(error);
      }

      return true;
    } catch (error) {
      console.error('Error reordering photos:', error);
      throw error;
    }
  }

  async searchPhotos(searchParams: PhotoSearch): Promise<SearchResult<Photo>> {
    try {
      const { query, filters, facets, highlight } = searchParams;

      let supabaseQuery = supabase
        .from(this.tableName)
        .select(`
          *,
          gallery:galleries!photos_gallery_id_fkey(
            id,
            title,
            slug
          ),
          uploader:members!photos_uploaded_by_fkey(
            id,
            name,
            image
          )
        `, { count: 'exact' });

      // Full-text search
      if (query) {
        supabaseQuery = supabaseQuery.textSearch('search_vector', query);
      }

      // Apply filters
      if (filters) {
        if (filters.galleryId) {
          supabaseQuery = supabaseQuery.eq('gallery_id', filters.galleryId);
        }
        if (filters.status) {
          supabaseQuery = supabaseQuery.eq('status', filters.status);
        }
        if (filters.tags && filters.tags.length > 0) {
          filters.tags.forEach(tag => {
            supabaseQuery = supabaseQuery.contains('tags', [tag]);
          });
        }
      }

      const { data, error, count } = await supabaseQuery;

      if (error) {
        throw handleSupabaseError(error);
      }

      return {
        items: data as Photo[],
        totalCount: count || 0,
        facets: facets ? await this.getFacets(facets, filters) : undefined,
        suggestions: query ? await this.getSuggestions(query) : undefined,
      };
    } catch (error) {
      console.error('Error searching photos:', error);
      throw error;
    }
  }

  async incrementViewCount(photoId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_photo_views', {
        photo_id: photoId
      });

      if (error) {
        console.error('Error incrementing view count:', error);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  async incrementDownloadCount(photoId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('increment_photo_downloads', {
        photo_id: photoId
      });

      if (error) {
        console.error('Error incrementing download count:', error);
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  }

  async getPhotoAnalytics(photoId: string): Promise<PhotoAnalytics> {
    try {
      const { data, error } = await supabase.rpc('get_photo_analytics', {
        photo_id: photoId
      });

      if (error) {
        throw handleSupabaseError(error);
      }

      return data as PhotoAnalytics;
    } catch (error) {
      console.error('Error fetching photo analytics:', error);
      throw error;
    }
  }

  async extractMetadata(file: File): Promise<PhotoMetadata> {
    return new Promise((resolve, reject) => {
      try {
        // Create a temporary image to extract basic metadata
        const img = new Image();
        img.onload = () => {
          const metadata: PhotoMetadata = {
            capturedAt: new Date().toISOString(),
          };

          // Try to extract EXIF data if available
          if (window.ExifReader) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                const tags = window.ExifReader.load(arrayBuffer);
                
                if (tags.DateTime) {
                  metadata.capturedAt = new Date(tags.DateTime.description).toISOString();
                }
                if (tags.Make) {
                  metadata.camera = tags.Make.description;
                }
                if (tags.Model) {
                  metadata.camera = `${metadata.camera || ''} ${tags.Model.description}`.trim();
                }
                if (tags.LensModel) {
                  metadata.lens = tags.LensModel.description;
                }
                if (tags.FocalLength) {
                  metadata.focalLength = `${tags.FocalLength.description}mm`;
                }
                if (tags.FNumber) {
                  metadata.aperture = `f/${tags.FNumber.description}`;
                }
                if (tags.ExposureTime) {
                  metadata.shutterSpeed = tags.ExposureTime.description;
                }
                if (tags.ISOSpeedRatings) {
                  metadata.iso = tags.ISOSpeedRatings.description;
                }
                if (tags.GPSLatitude && tags.GPSLongitude) {
                  metadata.location = {
                    latitude: tags.GPSLatitude.description,
                    longitude: tags.GPSLongitude.description,
                  };
                }
                if (tags.Keywords) {
                  metadata.keywords = tags.Keywords.description.split(',').map((k: string) => k.trim());
                }
                if (tags.Copyright) {
                  metadata.copyright = tags.Copyright.description;
                }
                if (tags.Artist) {
                  metadata.artist = tags.Artist.description;
                }
              } catch (exifError) {
                console.warn('Could not extract EXIF data:', exifError);
              }
              resolve(metadata);
            };
            reader.readAsArrayBuffer(file);
          } else {
            resolve(metadata);
          }
        };
        img.onerror = () => reject(new Error('Could not load image for metadata extraction'));
        img.src = URL.createObjectURL(file);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async getFacets(facetFields: string[], filters?: PhotoFilters): Promise<Record<string, Array<{ value: string; count: number }>>> {
    const facets: Record<string, Array<{ value: string; count: number }>> = {};

    for (const field of facetFields) {
      try {
        const { data, error } = await supabase.rpc('get_photo_facets', {
          field_name: field,
          filters: filters || {}
        });

        if (!error && data) {
          facets[field] = data;
        }
      } catch (error) {
        console.error(`Error getting facets for ${field}:`, error);
      }
    }

    return facets;
  }

  private async getSuggestions(query: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.rpc('get_search_suggestions', {
        query_text: query,
        suggestion_limit: 5
      });

      if (error) {
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  private extractPathFromUrl(url: string): string {
    // Extract the file path from a Supabase storage URL
    const urlParts = url.split('/storage/v1/object/public/photos/');
    return urlParts[1] || url;
  }
}

export const photoApi = new PhotoApi();