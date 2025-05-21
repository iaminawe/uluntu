import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface FeaturedSectionProps {
  title: string;
  description: string;
  items: React.ReactNode[];
  link: string;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ title, description, items, link }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">{description}</p>
        </div>
        <Link
          to={link}
          className="flex items-center text-orange-500 hover:text-orange-600 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items}
      </div>
    </div>
  );
};

export default FeaturedSection;
