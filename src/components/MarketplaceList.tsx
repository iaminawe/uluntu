'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Package, Briefcase, Monitor, Plus, Filter } from 'lucide-react';

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
  };
  location: string;
  tags: string[];
}

const SAMPLE_LISTINGS: Listing[] = [
  {
    id: 1,
    title: 'MacBook Pro 16" M1 Pro',
    description: 'Late 2021 model, 16GB RAM, 512GB SSD, excellent condition',
    type: 'equipment',
    price: 2000,
    condition: 'like-new',
    images: ['https://images.pexels.com/photos/303383/pexels-photo-303383.jpeg'],
    createdAt: '2025-03-15',
    seller: {
      id: 1,
      name: 'Sarah Johnson',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
    },
    location: 'Nelson, BC',
    tags: ['Apple', 'Laptop', 'Development']
  },
  {
    id: 2,
    title: 'Web Development Services',
    description: 'Full-stack development services for your next project',
    type: 'service',
    price: 75,
    images: ['https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg'],
    createdAt: '2025-03-14',
    seller: {
      id: 2,
      name: 'Michael Chen',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
    },
    location: 'Rossland, BC',
    tags: ['Web Development', 'React', 'Node.js']
  },
  {
    id: 3,
    title: 'Custom AI Model Development',
    description: 'Develop custom machine learning models for your business',
    type: 'service',
    price: 100,
    images: ['https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg'],
    createdAt: '2025-03-13',
    seller: {
      id: 3,
      name: 'Emma Wilson',
      image: 'https://images.pexels.com/photos/3796217/pexels-photo-3796217.jpeg'
    },
    location: 'Nelson, BC',
    tags: ['AI', 'Machine Learning', 'Consulting']
  }
];

export default function MarketplaceList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<ListingType | 'all'>('all');
  const [selectedCondition, setSelectedCondition] = useState<ListingCondition | 'all'>('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

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

  const types: ListingType[] = ['product', 'service', 'equipment'];
  const conditions: ListingCondition[] = ['new', 'like-new', 'good', 'fair', 'poor'];

  const filteredListings = SAMPLE_LISTINGS.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || listing.type === selectedType;
    const matchesCondition = selectedCondition === 'all' || listing.condition === selectedCondition;
    const matchesPrice = (!priceRange.min || listing.price >= Number(priceRange.min)) &&
      (!priceRange.max || listing.price <= Number(priceRange.max));
    return matchesSearch && matchesType && matchesCondition && matchesPrice;
  });

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="relative flex-1 max-w-xl">
            <input
              type="text"
              placeholder="Search marketplace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
          </div>
          <Link
            href="/marketplace/create"
            className="ml-4 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            List Item
          </Link>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedType === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              All Types
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center
                  ${selectedType === type
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                {getTypeIcon(type)}
                <span className="ml-2 capitalize">{type}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => {/* Open filters modal */}}
            className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 dark:bg-slate-700 
                     text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 
                     transition-colors flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map(listing => (
          <Link
            key={listing.id}
            href={`/marketplace/${listing.id}`}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                    {listing.title}
                  </h3>
                  <p className="text-orange-600 dark:text-orange-400">
                    ${listing.price}{listing.type === 'service' && '/hr'}
                  </p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-lg">
                  {getTypeIcon(listing.type)}
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {listing.description}
              </p>

              {listing.condition && (
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Condition: <span className="capitalize">{listing.condition}</span>
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={listing.seller.image}
                    alt={listing.seller.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {listing.seller.name}
                  </span>
                </div>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {listing.location}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}