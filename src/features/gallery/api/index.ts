// Gallery API Exports
export { galleryApi } from './galleryApi';
export { galleryApiNew } from './galleryApiNew';
export { groupGalleryApi } from './groupGalleryApi';
export { companyGalleryApi } from './companyGalleryApi';

// Note: Some APIs may need to be implemented
// export { photoApi } from './photoApi';
// export { uploadApi } from './uploadApi';
// export { promotionApi } from './promotionApi';
// export { pageHeaderAssignmentApi } from './pageHeaderApi';

// Re-export types for convenience
export type {
  Gallery,
  Photo,
  PhotoUploadInput,
  GalleryFilters,
  CreateGalleryInput,
  UpdateGalleryInput,
  BatchUploadFile,
  BatchUploadConfig,
  BatchUploadProgress,
  BatchUploadQueue,
  FileValidationResult,
  BatchUploadHooks,
  BatchUploadResult
} from '../types';