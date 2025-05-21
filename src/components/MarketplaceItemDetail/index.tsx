import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Mail } from 'lucide-react';
import { Listing, SAMPLE_LISTING } from './types';
import { getTypeIcon } from './utils';
import ContactModal from './ContactModal';

interface MarketplaceItemDetailProps {
  itemId: string;
}

const MarketplaceItemDetail = ({ itemId }: MarketplaceItemDetailProps) => {
  const [listing, setListing] = useState<Listing>(SAMPLE_LISTING); // In a real app, fetch by ID
  const [showContactModal, setShowContactModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left column - Image gallery */}
        <div>
          <div className="mb-4 overflow-hidden rounded-lg">
            <img
              src={listing.images[currentImageIndex]}
              alt={listing.title}
              className="w-full h-96 object-cover"
            />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                    index === currentImageIndex ? 'ring-2 ring-orange-500' : 'opacity-70'
                  }`}
                >
                  <img src={image} alt={`${listing.title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right column - Listing details */}
        <div>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  {listing.title}
                </h1>
                <p className="text-2xl text-orange-600 dark:text-orange-400">
                  ${listing.price}{listing.type === 'service' && '/hr'}
                </p>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
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
                Listed {new Date(listing.createdAt).toLocaleDateString()}
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
              onClick={() => setShowContactModal(true)}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
            >
              <Mail className="h-5 w-5 mr-2" />
              Contact Seller
            </button>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">About the Seller</h2>
              <div className="flex items-start space-x-4">
                <Link to={`/directory/${listing.seller.id}`}>
                  <img
                    src={listing.seller.image}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full"
                  />
                </Link>
                <div>
                  <Link
                    to={`/directory/${listing.seller.id}`}
                    className="font-medium text-slate-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                  >
                    {listing.seller.name}
                  </Link>
                  {listing.seller.title && (
                    <p className="text-slate-600 dark:text-slate-300">{listing.seller.title}</p>
                  )}
                  {listing.seller.bio && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{listing.seller.bio}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <ContactModal
          listing={listing}
          onClose={() => setShowContactModal(false)}
        />
      )}
    </div>
  );
};

export default MarketplaceItemDetail;
