// Temporary SkeletonImage component for marketplace
interface SkeletonImageProps {
  className?: string;
  width?: string;
  height?: string;
}

export const SkeletonImage = ({ 
  className = '', 
  width = '100%', 
  height = '200px' 
}: SkeletonImageProps) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ width, height }}
    />
  );
};