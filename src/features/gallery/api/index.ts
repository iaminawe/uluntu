// Gallery API Exports
export { galleryApi } from './galleryApi';
export { photoApi } from './photoApi';
export { uploadApi } from './uploadApi';
export { promotionApi } from './promotionApi';
export { pageHeaderAssignmentApi } from './pageHeaderApi';
export { groupGalleryApi } from './groupGalleryApi';
export { companyGalleryApi } from './companyGalleryApi';

// Re-export types for convenience
export type {
  Gallery,
  Photo,
  PhotoUpload,
  BatchUpload,
  PhotoPromotionRequest,
  PageHeaderAssignment,
  GalleryFilters,
  PhotoFilters,
  CreateGalleryData,
  UpdateGalleryData,
  CreatePhotoData,
  UpdatePhotoData,
  CreatePromotionRequestData,
  CreatePageHeaderAssignmentData,
  UploadOptions,
  ImageProcessingOptions,
  PhotosResponse,
  GalleriesResponse,
  PromotionRequestsResponse,
  PageHeaderAssignmentsResponse,
} from '../types';