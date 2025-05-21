import { format } from 'date-fns';
import { Mail, MapPin, Calendar } from 'lucide-react';
import { ListingDetailsProps } from './types';

const ListingDetails: React.FC<ListingDetailsProps> = ({ listing, getTypeIcon, onContactClick }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        {listing.images && listing.images.length > 0 && (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-72 object-cover"
          />
        )}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
          ${listing.price.toLocaleString()}
        </div>
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {listing.title}
        </h1>
        
        <div className="flex items-center text-orange-500 mb-4">
          <div className="flex items-center mr-4">
            {getTypeIcon(listing.type)}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <MapPin className="h-5 w-5 mr-2" />
            {listing.location}
          </div>
          <div className="flex items-center text-slate-600 dark:text-slate-300">
            <Calendar className="h-5 w-5 mr-2" />
            Listed {format(new Date(listing.createdAt), 'MMMM d, yyyy')}
          </div>
          {listing.condition && (
            <p className="text-slate-600 dark:text-slate-300">
              Condition: <span className="capitalize">{listing.condition}</span>
            </p>
          )}
        </div>

        <div className="prose dark:prose-invert max-w-none mb-6">
          {listing.description.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={index} className="list-disc list-inside mb-4">
                  {items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={index} className="mb-4">{paragraph}</p>;
          })}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {listing.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <button
          onClick={onContactClick}
          className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
        >
          <Mail className="h-5 w-5 mr-2" />
          Contact Seller
        </button>
      </div>
    </div>
  );
};

export default ListingDetails;
