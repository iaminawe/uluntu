import React, { useState, useEffect } from 'react';
import { Plus, X, Image, Eye, Star, GripVertical, Edit3 } from 'lucide-react';
import { opportunitiesApi } from '../api/opportunitiesApi';
import { galleryApi } from '@/features/gallery/api/galleryApi';
import { OpportunityGallery, AttachableGallery, AttachGalleryInput, UpdateGalleryAttachmentInput } from '../types';

interface OpportunityGalleryManagerProps {
  opportunityId: string;
  canEdit?: boolean;
  onGalleryUpdate?: () => void;
}

export const OpportunityGalleryManager: React.FC<OpportunityGalleryManagerProps> = ({
  opportunityId,
  canEdit = false,
  onGalleryUpdate
}) => {
  const [attachedGalleries, setAttachedGalleries] = useState<OpportunityGallery[]>([]);
  const [availableGalleries, setAvailableGalleries] = useState<AttachableGallery[]>([]);
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingAttachment, setEditingAttachment] = useState<OpportunityGallery | null>(null);

  useEffect(() => {
    loadAttachedGalleries();
    if (canEdit) {
      loadAvailableGalleries();
    }
  }, [opportunityId, canEdit]);

  const loadAttachedGalleries = async () => {
    try {
      setLoading(true);
      const galleries = await opportunitiesApi.getOpportunityGalleries(opportunityId);
      setAttachedGalleries(galleries);
    } catch (error) {
      console.error('Error loading attached galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableGalleries = async () => {
    try {
      const galleries = await opportunitiesApi.getAttachableGalleries(opportunityId);
      setAvailableGalleries(galleries);
    } catch (error) {
      console.error('Error loading available galleries:', error);
    }
  };

  const handleAttachGallery = async (galleryId: string, featured: boolean = false, caption?: string) => {
    try {
      const input: AttachGalleryInput = {
        opportunity_id: opportunityId,
        gallery_id: galleryId,
        display_order: attachedGalleries.length,
        featured,
        caption
      };

      const result = await opportunitiesApi.attachGallery(input);
      if (result) {
        await loadAttachedGalleries();
        await loadAvailableGalleries();
        setShowAttachDialog(false);
        onGalleryUpdate?.();
      }
    } catch (error) {
      console.error('Error attaching gallery:', error);
    }
  };

  const handleDetachGallery = async (attachmentId: string) => {
    try {
      const success = await opportunitiesApi.detachGallery(attachmentId);
      if (success) {
        await loadAttachedGalleries();
        await loadAvailableGalleries();
        onGalleryUpdate?.();
      }
    } catch (error) {
      console.error('Error detaching gallery:', error);
    }
  };

  const handleUpdateAttachment = async (attachmentId: string, updates: UpdateGalleryAttachmentInput) => {
    try {
      const result = await opportunitiesApi.updateGalleryAttachment(attachmentId, updates);
      if (result) {
        await loadAttachedGalleries();
        setEditingAttachment(null);
        onGalleryUpdate?.();
      }
    } catch (error) {
      console.error('Error updating gallery attachment:', error);
    }
  };

  const getCoverImageUrl = (gallery: any) => {
    if (gallery?.cover_photo_id) {
      // Construct cover photo URL from storage path
      return `/api/gallery-photos/${gallery.cover_photo_id}`;
    }
    return '/placeholder-image.png';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Galleries</h3>
          <p className="text-sm text-gray-600">
            {attachedGalleries.length === 0 
              ? 'No galleries attached to this opportunity'
              : `${attachedGalleries.length} ${attachedGalleries.length === 1 ? 'gallery' : 'galleries'} attached`
            }
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAttachDialog(true)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Attach Gallery
          </button>
        )}
      </div>

      {/* Attached Galleries */}
      {attachedGalleries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachedGalleries.map((attachment) => (
            <div key={attachment.id} className="bg-white rounded-lg shadow border overflow-hidden">
              {/* Gallery Image */}
              <div className="relative h-48">
                <img
                  src={getCoverImageUrl(attachment.gallery)}
                  alt={attachment.gallery?.title || 'Gallery'}
                  className="w-full h-full object-cover"
                />
                {attachment.featured && (
                  <div className="absolute top-2 left-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  </div>
                )}
                {canEdit && (
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => setEditingAttachment(attachment)}
                      className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-75"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDetachGallery(attachment.id)}
                      className="p-1 bg-black bg-opacity-50 text-white rounded hover:bg-opacity-75"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Gallery Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">
                      {attachment.gallery?.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {attachment.gallery?.photo_count} photos
                    </p>
                    {attachment.caption && (
                      <p className="text-sm text-gray-700 mt-2 italic">
                        "{attachment.caption}"
                      </p>
                    )}
                  </div>
                  <a
                    href={`/galleries/${attachment.gallery?.slug}`}
                    className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                    title="View Gallery"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                </div>

                {/* Owner Info */}
                <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                  {attachment.gallery?.owner_image && (
                    <img
                      src={attachment.gallery.owner_image}
                      alt={attachment.gallery?.owner_name}
                      className="h-6 w-6 rounded-full"
                    />
                  )}
                  <span className="ml-2 text-sm text-gray-600">
                    by {attachment.gallery?.owner_name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attach Gallery Dialog */}
      {showAttachDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Attach Gallery</h3>
                <button
                  onClick={() => setShowAttachDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {availableGalleries.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No galleries available to attach</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableGalleries.map((gallery) => (
                    <div
                      key={gallery.id}
                      className={`bg-white rounded-lg shadow border overflow-hidden ${
                        gallery.is_attached ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-md'
                      }`}
                      onClick={() => !gallery.is_attached && handleAttachGallery(gallery.id)}
                    >
                      <div className="relative h-32">
                        <img
                          src={getCoverImageUrl(gallery)}
                          alt={gallery.title}
                          className="w-full h-full object-cover"
                        />
                        {gallery.is_attached && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">Already Attached</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-gray-900 truncate">{gallery.title}</h4>
                        <p className="text-sm text-gray-600">{gallery.photo_count} photos</p>
                        <div className="flex items-center mt-2">
                          {gallery.owner_image && (
                            <img
                              src={gallery.owner_image}
                              alt={gallery.owner_name}
                              className="h-4 w-4 rounded-full"
                            />
                          )}
                          <span className="ml-1 text-xs text-gray-500">
                            by {gallery.owner_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Attachment Dialog */}
      {editingAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Edit Gallery Attachment</h3>
                <button
                  onClick={() => setEditingAttachment(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updates: UpdateGalleryAttachmentInput = {
                  featured: formData.get('featured') === 'on',
                  caption: formData.get('caption') as string || undefined,
                  display_order: parseInt(formData.get('display_order') as string) || 0
                };
                handleUpdateAttachment(editingAttachment.id, updates);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Caption (optional)
                </label>
                <textarea
                  name="caption"
                  rows={3}
                  defaultValue={editingAttachment.caption || ''}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add a caption to describe how this gallery relates to the opportunity..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  min="0"
                  defaultValue={editingAttachment.display_order}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingAttachment.featured}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Featured gallery</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAttachment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunityGalleryManager;