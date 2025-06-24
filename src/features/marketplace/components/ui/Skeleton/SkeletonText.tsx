// Temporary SkeletonText component for marketplace
interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText = ({ lines = 1, className = '' }: SkeletonTextProps) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className="animate-pulse bg-gray-200 h-4 rounded mb-2 last:mb-0"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};