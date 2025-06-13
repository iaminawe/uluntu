import { FormImageUpload } from '@/shared/components/ui/Form';
import { ImagesGallerySectionProps } from './types';

const ImagesGallerySection = ({
  images,
  handleImageChange,
  handleRemoveImage,
  isSubmitting
}: ImagesGallerySectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-slate-800 dark:text-white">
        Listing Images
      </h3>
      
      <FormImageUpload
        id="listing-images"
        name="images"
        currentImage={images.length > 0 ? images[0] : undefined}
        onChange={handleImageChange}
        disabled={isSubmitting}
        placeholder="Upload images of your listing"
        helperText="Listings with images get more attention!"
        maxSize={2 * 1024 * 1024} // 2MB limit per image
        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
      />
      
      {images.length > 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {images.slice(1).map((imageSrc, index) => (
            <div 
              key={index} 
              className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              <img 
                src={imageSrc} 
                alt={`Listing image ${index + 2}`}
                className="w-full h-32 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(index + 1)}
                disabled={isSubmitting}
                className="absolute top-2 right-2 bg-white dark:bg-slate-800 rounded-full p-1
                        text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="sr-only">Remove image</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImagesGallerySection;
