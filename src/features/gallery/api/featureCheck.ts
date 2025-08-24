import { settingsApi } from '@/features/admin/api/settings';

/**
 * Check if photo galleries feature is enabled
 * Throws an error if the feature is disabled
 */
export async function requirePhotoGalleriesFeature(): Promise<void> {
  const isEnabled = await settingsApi.isFeatureEnabled('photo_galleries');
  
  if (!isEnabled) {
    throw new Error('Photo galleries feature is currently disabled. Please contact your administrator.');
  }
}

/**
 * Check if photo galleries feature is enabled (non-throwing version)
 * Returns false if the feature is disabled
 */
export async function isPhotoGalleriesEnabled(): Promise<boolean> {
  try {
    return await settingsApi.isFeatureEnabled('photo_galleries');
  } catch (error) {
    console.error('Error checking photo galleries feature:', error);
    return false;
  }
}