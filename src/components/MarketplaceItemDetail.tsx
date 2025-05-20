'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Briefcase, Monitor, MapPin, Calendar, Mail, X } from 'lucide-react';

type ListingType = 'product' | 'service' | 'equipment';
type ListingCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

interface Listing {
  id: number;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  condition?: ListingCondition;
  images: string[];
  createdAt: string;
  seller: {
    id: number;
    name: string;
    image: string;
    title?: string;
    bio?: string;
  };
  location: string;
  tags: string[];
}

// This would come from your database
const SAMPLE_LISTING: Listing = {
  id: 1,
  title: 'MacBook Pro 16" M1 Pro',
  description: `Late 2021 model in excellent condition. Perfect for development work.

Specifications:
- M1 Pro chip
- 16GB unified memory
- 512GB SSD
- 16-inch Liquid Retina XDR display
- Space Gray

Includes original charger and box. Battery cycle count under 100.`,
  type: 'equipment',
  price: 2000,
  condition: 'like-new',
  images: [
    'https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg',
    'https://images.pexels.com/photos/5474296/pexels-photo-5474296.jpeg'
  ],
  createdAt: '2025-03-15',
  seller: {
    id: 1,
    name: 'Sarah Johnson',
    title: 'Senior Developer',
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    bio: 'Full-stack developer with 8 years of experience. Passionate about clean code and great user experiences.'
  },
  location: 'Nelson, BC',
  tags: ['Apple', 'Laptop', 'Development']
};

interface ContactModalProps {
  listing: Listing;
  onClose: () => void;
}

function ContactModal({ listing, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Message sent:', formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
            Contact about {listing.title}
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MarketplaceItemDetail({ itemId }: { itemId: string }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // In a real app, you'd fetch the listing data based on the itemId
  const listing = SAMPLE_LISTING;

  const getTypeIcon = (type: ListingType) => {
    switch (type) {
      case 'product':
        return <Package className="h-5 w-5" />;
      case 'service':
        return <Briefcase className="h-5 w-5" />;
      case 'equipment':
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="relative h-96">
              <img
                src={listing.images[selectedImage]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {listing.images.length > 1 && (
              <div className="p-4 flex gap-2">
                {listing.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors
                      ${index === selectedImage
                        ? 'border-orange-500'
                        : 'border-transparent hover:border-orange-300'
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${listing.title} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-6 md:w-1/2">
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
                <Link href={`/directory/${listing.seller.id}`}>
                  <img
                    src={listing.seller.image}
                    alt={listing.seller.name}
                    className="w-12 h-12 rounded-full"
                  />
                </Link>
                <div>
                  <Link
                    href={`/directory/${listing.seller.id}`}
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
}