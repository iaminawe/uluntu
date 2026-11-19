export interface StoredPaths {
  storage_path: string | null;
  medium_path?: string | null;
  thumbnail_path?: string | null;
}

/**
 * Every size of each photo that lives in the gallery-photos bucket. Sample
 * photos point at external URLs and have nothing to delete.
 */
export function storedFilePaths(photos: StoredPaths[]): string[] {
  return photos
    .flatMap(p => [p.storage_path, p.medium_path, p.thumbnail_path])
    .filter((path): path is string => !!path && !/^https?:\/\//.test(path));
}
