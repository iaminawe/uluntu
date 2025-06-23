import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { resourcesApi } from '@/features/resources/api/resourcesApi';
import type { Resource } from '@/types';

/**
 * Hook to get all gallery resources
 */
export const useGalleryResources = () => {
  return useQuery<Resource[]>('gallery-resources', async () => {
    // This would need to be implemented in the resourcesApi
    // For now, we'll fetch all resources and filter client-side
    const allResources = await resourcesApi.getAllResources();
    return allResources.filter(resource => resource.type === 'gallery');
  }, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to check if a gallery is already added as a resource
 */
export const useIsGalleryResource = (galleryId: string) => {
  const [isResource, setIsResource] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfResource = async () => {
      try {
        setLoading(true);
        const allResources = await resourcesApi.getAllResources();
        const galleryUrl = `/galleries/${galleryId}`;
        const exists = allResources.some(
          resource => resource.type === 'gallery' && resource.url === galleryUrl
        );
        setIsResource(exists);
      } catch (error) {
        console.error('Error checking if gallery is resource:', error);
        setIsResource(false);
      } finally {
        setLoading(false);
      }
    };

    if (galleryId) {
      checkIfResource();
    }
  }, [galleryId]);

  return { isResource, loading };
};

/**
 * Hook to add a gallery as a resource
 */
export const useAddGalleryResource = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGalleryResource = async (
    galleryId: string,
    title: string,
    description?: string,
    image?: string,
    contributorId?: string,
    groupId?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      await resourcesApi.createResource({
        title,
        description: description || `Photo gallery: ${title}`,
        type: 'gallery',
        url: `/galleries/${galleryId}`,
        image: image || null,
        status: 'published',
        featured: false,
        contributorId: contributorId || '',
        groupId,
        tags: ['gallery', 'photos', 'community']
      });

      return true;
    } catch (err) {
      console.error('Error adding gallery as resource:', err);
      setError('Failed to add gallery to resources');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addGalleryResource,
    loading,
    error,
    clearError: () => setError(null)
  };
};