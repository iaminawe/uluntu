import type { PhotoUploadValidation, GallerySystemSettings } from '@/types/adminGallery';
import { logger } from '@/utils/logger';

/**
 * Admin Gallery Validation Service
 * Provides comprehensive validation for admin gallery operations
 */
export class AdminGalleryValidationService {
  
  // Default system settings (should be loaded from database)
  private defaultSettings: GallerySystemSettings = {
    max_photos_per_gallery: 1000,
    max_file_size: 50 * 1024 * 1024, // 50MB
    allowed_file_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    auto_moderation_enabled: true,
    require_approval_for_public: false,
    storage_quota_per_user: 1000 * 1024 * 1024, // 1GB
    enable_storage_analytics: true,
    default_gallery_privacy: 'public',
    enable_photo_downloads: true,
    watermark_enabled: false,
    compression_enabled: true,
    compression_quality: 85
  };

  /**
   * Validate photo upload for admin operations
   */
  async validatePhotoUpload(file: File, galleryId?: string): Promise<PhotoUploadValidation> {
    const validation: PhotoUploadValidation = {
      file_size_valid: true,
      file_type_valid: true,
      dimensions_valid: true,
      content_safe: true,
      errors: [],
      warnings: []
    };

    try {
      // Get current system settings (in real implementation, fetch from database)
      const settings = await this.getSystemSettings();

      // Validate file size
      if (file.size > settings.max_file_size) {
        validation.file_size_valid = false;
        validation.errors.push(
          `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.formatFileSize(settings.max_file_size)}`
        );
      }

      // Validate file type
      if (!settings.allowed_file_types.includes(file.type)) {
        validation.file_type_valid = false;
        validation.errors.push(
          `File type ${file.type} is not allowed. Allowed types: ${settings.allowed_file_types.join(', ')}`
        );
      }

      // Validate dimensions (if it's an image)
      if (file.type.startsWith('image/')) {
        try {
          const dimensions = await this.getImageDimensions(file);
          
          // Check minimum dimensions
          if (dimensions.width < 100 || dimensions.height < 100) {
            validation.dimensions_valid = false;
            validation.errors.push('Image dimensions too small. Minimum 100x100 pixels required.');
          }
          
          // Check maximum dimensions (optional warning)
          if (dimensions.width > 8000 || dimensions.height > 8000) {
            validation.warnings.push('Very large image dimensions detected. Consider resizing for better performance.');
          }
          
          // Check aspect ratio (optional warning for extreme ratios)
          const aspectRatio = dimensions.width / dimensions.height;
          if (aspectRatio > 10 || aspectRatio < 0.1) {
            validation.warnings.push('Extreme aspect ratio detected. Image may not display well in gallery.');
          }
          
        } catch (error) {
          validation.warnings.push('Could not validate image dimensions.');
          logger.warn('Image dimension validation failed', 'ADMIN_GALLERY_VALIDATION', error);
        }
      }

      // Validate gallery constraints
      if (galleryId) {
        const galleryValidation = await this.validateGalleryConstraints(galleryId);
        if (!galleryValidation.can_add_photos) {
          validation.errors.push(galleryValidation.reason || 'Cannot add more photos to this gallery');
        }
      }

      // Content safety validation (placeholder - would integrate with actual moderation service)
      const contentSafety = await this.validateContentSafety(file);
      if (!contentSafety.safe) {
        validation.content_safe = false;
        validation.errors.push('Content appears to violate community guidelines');
      }

      // Add warnings for large files
      if (file.size > 10 * 1024 * 1024) { // 10MB
        validation.warnings.push('Large file size detected. Upload may take longer and affect performance.');
      }

      // Validate filename
      const filenameValidation = this.validateFilename(file.name);
      if (!filenameValidation.valid) {
        validation.errors.push(filenameValidation.error || 'Invalid filename');
      }

    } catch (error) {
      logger.error('Photo upload validation failed', 'ADMIN_GALLERY_VALIDATION', error);
      validation.errors.push('Validation service error');
    }

    return validation;
  }

  /**
   * Validate bulk operation constraints
   */
  validateBulkOperation(itemCount: number, operationType: string): { valid: boolean; errors: string[]; warnings: string[] } {
    const result = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Check bulk operation limits
    const maxBulkSize = this.getBulkOperationLimit(operationType);
    
    if (itemCount > maxBulkSize) {
      result.valid = false;
      result.errors.push(`Bulk operation limited to ${maxBulkSize} items. Requested: ${itemCount}`);
    }

    if (itemCount === 0) {
      result.valid = false;
      result.errors.push('No items selected for bulk operation');
    }

    // Add performance warnings
    if (itemCount > 50 && operationType === 'delete') {
      result.warnings.push('Large bulk deletion may take several minutes to complete');
    }

    if (itemCount > 20 && operationType === 'upload') {
      result.warnings.push('Large bulk upload may take significant time and bandwidth');
    }

    return result;
  }

  /**
   * Validate gallery metadata updates
   */
  validateGalleryUpdate(updates: {
    title?: string;
    description?: string;
    privacy_level?: string;
    visibility?: string;
    tags?: string[];
  }): { valid: boolean; errors: string[]; sanitized: any } {
    const result = {
      valid: true,
      errors: [] as string[],
      sanitized: { ...updates }
    };

    // Validate title
    if (updates.title !== undefined) {
      if (!updates.title || updates.title.trim().length === 0) {
        result.valid = false;
        result.errors.push('Gallery title is required');
      } else if (updates.title.length > 255) {
        result.valid = false;
        result.errors.push('Gallery title must be 255 characters or less');
      } else {
        result.sanitized.title = updates.title.trim();
      }
    }

    // Validate description
    if (updates.description !== undefined) {
      if (updates.description && updates.description.length > 2000) {
        result.valid = false;
        result.errors.push('Gallery description must be 2000 characters or less');
      } else {
        result.sanitized.description = updates.description?.trim();
      }
    }

    // Validate privacy level
    if (updates.privacy_level !== undefined) {
      const validPrivacyLevels = ['public', 'members_only', 'private'];
      if (!validPrivacyLevels.includes(updates.privacy_level)) {
        result.valid = false;
        result.errors.push(`Invalid privacy level. Must be one of: ${validPrivacyLevels.join(', ')}`);
      }
    }

    // Validate visibility
    if (updates.visibility !== undefined) {
      const validVisibility = ['visible', 'hidden', 'archived'];
      if (!validVisibility.includes(updates.visibility)) {
        result.valid = false;
        result.errors.push(`Invalid visibility. Must be one of: ${validVisibility.join(', ')}`);
      }
    }

    // Validate tags
    if (updates.tags !== undefined) {
      if (!Array.isArray(updates.tags)) {
        result.valid = false;
        result.errors.push('Tags must be an array');
      } else if (updates.tags.length > 20) {
        result.valid = false;
        result.errors.push('Maximum 20 tags allowed');
      } else {
        // Sanitize tags
        result.sanitized.tags = updates.tags
          .filter(tag => tag && typeof tag === 'string')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0 && tag.length <= 50)
          .slice(0, 20); // Ensure limit
      }
    }

    return result;
  }

  /**
   * Validate photo metadata updates
   */
  validatePhotoUpdate(updates: {
    title?: string;
    description?: string;
    tags?: string[];
    visibility?: string;
    moderation_status?: string;
  }): { valid: boolean; errors: string[]; sanitized: any } {
    const result = {
      valid: true,
      errors: [] as string[],
      sanitized: { ...updates }
    };

    // Validate title
    if (updates.title !== undefined) {
      if (updates.title && updates.title.length > 255) {
        result.valid = false;
        result.errors.push('Photo title must be 255 characters or less');
      } else {
        result.sanitized.title = updates.title?.trim();
      }
    }

    // Validate description
    if (updates.description !== undefined) {
      if (updates.description && updates.description.length > 1000) {
        result.valid = false;
        result.errors.push('Photo description must be 1000 characters or less');
      } else {
        result.sanitized.description = updates.description?.trim();
      }
    }

    // Validate visibility
    if (updates.visibility !== undefined) {
      const validVisibility = ['visible', 'hidden'];
      if (!validVisibility.includes(updates.visibility)) {
        result.valid = false;
        result.errors.push(`Invalid visibility. Must be one of: ${validVisibility.join(', ')}`);
      }
    }

    // Validate moderation status
    if (updates.moderation_status !== undefined) {
      const validStatuses = ['pending', 'approved', 'rejected', 'flagged'];
      if (!validStatuses.includes(updates.moderation_status)) {
        result.valid = false;
        result.errors.push(`Invalid moderation status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate tags (same as gallery)
    if (updates.tags !== undefined) {
      if (!Array.isArray(updates.tags)) {
        result.valid = false;
        result.errors.push('Tags must be an array');
      } else if (updates.tags.length > 15) {
        result.valid = false;
        result.errors.push('Maximum 15 tags allowed for photos');
      } else {
        result.sanitized.tags = updates.tags
          .filter(tag => tag && typeof tag === 'string')
          .map(tag => tag.trim().toLowerCase())
          .filter(tag => tag.length > 0 && tag.length <= 30)
          .slice(0, 15);
      }
    }

    return result;
  }

  /**
   * Validate admin permissions for operation
   */
  async validateAdminPermission(userId: string, operation: string, resourceId?: string): Promise<{
    allowed: boolean;
    reason?: string;
    requiredRole?: string;
  }> {
    // This would integrate with your actual permission system
    // For now, a simplified version
    
    try {
      // Check if user has admin role (would use actual permission check)
      const hasAdminRole = await this.checkAdminRole(userId);
      
      if (!hasAdminRole) {
        return {
          allowed: false,
          reason: 'Admin role required',
          requiredRole: 'admin'
        };
      }

      // Check specific operation permissions
      const operationPermissions = {
        'delete_any_photo': ['super_admin', 'admin'],
        'delete_any_gallery': ['super_admin'],
        'moderate_content': ['super_admin', 'admin', 'moderator'],
        'view_analytics': ['super_admin', 'admin'],
        'bulk_operations': ['super_admin', 'admin'],
        'manage_settings': ['super_admin']
      };

      const requiredRoles = operationPermissions[operation as keyof typeof operationPermissions];
      if (requiredRoles) {
        const userRoles = await this.getUserRoles(userId);
        const hasPermission = requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasPermission) {
          return {
            allowed: false,
            reason: `Insufficient permissions for ${operation}`,
            requiredRole: requiredRoles[0]
          };
        }
      }

      return { allowed: true };

    } catch (error) {
      logger.error('Permission validation failed', 'ADMIN_GALLERY_VALIDATION', error);
      return {
        allowed: false,
        reason: 'Permission validation error'
      };
    }
  }

  /**
   * Private helper methods
   */
  private async getSystemSettings(): Promise<GallerySystemSettings> {
    // In real implementation, would fetch from database
    // For now, return defaults
    return this.defaultSettings;
  }

  private async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not load image'));
      };
      
      img.src = url;
    });
  }

  private async validateGalleryConstraints(galleryId: string): Promise<{
    can_add_photos: boolean;
    reason?: string;
    current_count?: number;
    max_allowed?: number;
  }> {
    // Would check gallery photo count against limits
    // Placeholder implementation
    return {
      can_add_photos: true,
      current_count: 0,
      max_allowed: this.defaultSettings.max_photos_per_gallery
    };
  }

  private async validateContentSafety(file: File): Promise<{ safe: boolean; confidence?: number; flags?: string[] }> {
    // Would integrate with content moderation API
    // Placeholder implementation
    return { safe: true, confidence: 1.0, flags: [] };
  }

  private validateFilename(filename: string): { valid: boolean; error?: string } {
    // Check for dangerous characters
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(filename)) {
      return {
        valid: false,
        error: 'Filename contains invalid characters'
      };
    }

    // Check length
    if (filename.length > 255) {
      return {
        valid: false,
        error: 'Filename too long (max 255 characters)'
      };
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\..+)?$/i;
    if (reservedNames.test(filename)) {
      return {
        valid: false,
        error: 'Filename uses reserved system name'
      };
    }

    return { valid: true };
  }

  private getBulkOperationLimit(operation: string): number {
    const limits = {
      'delete': 100,
      'upload': 50,
      'moderate': 200,
      'move': 100,
      'tag': 500
    };

    return limits[operation as keyof typeof limits] || 50;
  }

  private async checkAdminRole(userId: string): Promise<boolean> {
    // Would integrate with actual role checking system
    // Placeholder implementation
    return true; // For now, assume all operations are by admins
  }

  private async getUserRoles(userId: string): Promise<string[]> {
    // Would fetch actual user roles
    // Placeholder implementation
    return ['admin']; // For now, return admin role
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export singleton instance
export const adminGalleryValidation = new AdminGalleryValidationService();