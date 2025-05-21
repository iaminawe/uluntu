import { Upload, X } from 'lucide-react';
import { ImagesGallerySectionProps } from './types';

const ImagesGallerySection = ({
  images,
  handleRemoveImage,
  isSubmitting
}: ImagesGallerySectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white">
        Listing Images
      </h3>
      
      <div className="flex flex-col space-y-4">
        <button
          type="button"
          disabled={isSubmitting}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6
                  flex flex-col items-center justify-center text-slate-500 dark:text-slate-400
                  hover:border-orange-500 hover:text-orange-500 transition-colors"
        >
          <Upload className="h-8 w-8 mb-2" />
          <span className="text-sm font-medium">Upload Images</span>
          <span className="text-xs mt-1">Click to select files or drag and drop</span>
        </button>
        
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {images.map((imageSrc, index) => (
              <div 
                key={index} 
                className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
              >
                <img 
                  src={imageSrc} 
                  alt={`Listing image ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  disabled={isSubmitting}
                  className="absolute top-2 right-2 bg-white dark:bg-slate-800 rounded-full p-1
                          text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {images.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            No images uploaded yet. Listings with images get more attention!
          </p>
        )}
      </div>
    </div>
  );
};

export default ImagesGallerySection;
